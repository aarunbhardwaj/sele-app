// This script updates the permissions on the Courses collection to allow any authenticated user
// with the right role permissions to create courses, instead of relying on team membership

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database and collection IDs - make sure these match what's in the main app
const DATABASE_ID = '6865602f000c8cc789bc';
const COURSES_COLLECTION_ID = '6865dcb4001f03a2d904';

async function updateCoursesCollectionPermissions() {
    try {
        console.log('Updating Courses collection permissions...');
        
        // Get current collection info
        const collection = await databases.getCollection(
            DATABASE_ID,
            COURSES_COLLECTION_ID
        );
        
        console.log('Current permissions:', collection.permissions);
        
        // Update the collection permissions to allow any authenticated user to create
        const updatedCollection = await databases.updateCollection(
            DATABASE_ID,
            COURSES_COLLECTION_ID,
            collection.name,
            [
                Permission.read(Role.users()), // All authenticated users can read
                Permission.create(Role.users()), // All authenticated users can create - document level permissions will be handled in app logic
                Permission.update(Role.users()), // All authenticated users can update - document level permissions will be handled in app logic
                Permission.delete(Role.users())  // All authenticated users can delete - document level permissions will be handled in app logic
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
updateCoursesCollectionPermissions()
    .then(() => console.log('Done!'))
    .catch(err => console.error('Failed:', err));