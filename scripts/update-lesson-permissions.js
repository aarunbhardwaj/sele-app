// This script updates the permissions for the lessons collection
// to allow admins to have full access without additional checks

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
const LESSONS_COLLECTION_ID = '6865e600000561ebba31';

async function updateLessonPermissions() {
    try {
        console.log('Updating lessons collection permissions...');
        
        // Update the permissions for the lessons collection with simple, broad permissions
        await databases.updateCollection(
            DATABASE_ID,
            LESSONS_COLLECTION_ID,
            'lessons',  // Collection name
            [
                Permission.read(Role.users()),  // All authenticated users can read
                Permission.create(Role.any()),  // Anyone can create (we'll handle auth in the app)
                Permission.update(Role.any()),  // Anyone can update (we'll handle auth in the app)
                Permission.delete(Role.any())   // Anyone can delete (we'll handle auth in the app)
            ]
        );
        
        console.log('Successfully updated lessons collection permissions!');
    } catch (error) {
        console.error('Error updating permissions:', error);
    }
}

// Run the update function
updateLessonPermissions()
    .then(() => console.log('Done! Admins now have full access to lessons.'))
    .catch(err => console.error('Failed:', err));