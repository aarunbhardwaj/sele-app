// This script updates the permissions on the Roles collection to allow any authenticated user
// to create, read, update, and delete roles, instead of requiring admin team membership

const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database and collection IDs - make sure these match what's in the main app
const DATABASE_ID = '6865602f000c8cc789bc';
const ROLES_COLLECTION_ID = '6867fe9a000b1af9bdb8';

async function updateRolesCollectionPermissions() {
    try {
        console.log('Updating Roles collection permissions...');
        
        // Get current collection info
        const collection = await databases.getCollection(
            DATABASE_ID,
            ROLES_COLLECTION_ID
        );
        
        console.log('Current permissions:', collection.permissions);
        
        // Update the collection permissions to allow any authenticated user to manage roles
        // Your application will handle authorization at the application level
        const updatedCollection = await databases.updateCollection(
            DATABASE_ID,
            ROLES_COLLECTION_ID,
            collection.name,
            [
                Permission.read(Role.users()), // All authenticated users can read
                Permission.create(Role.users()), // All authenticated users can create
                Permission.update(Role.users()), // All authenticated users can update
                Permission.delete(Role.users())  // All authenticated users can delete
            ]
        );
        
        console.log('Collection permissions updated successfully.');
        console.log('New permissions:', updatedCollection.permissions);
        
        return updatedCollection;
    } catch (error) {
        console.error('Error updating collection permissions:', error);
        throw error;
    }
}

// Run the update function
updateRolesCollectionPermissions()
    .then(() => console.log('Done! Users can now manage roles without being in an admin team.'))
    .catch(err => console.error('Failed:', err));