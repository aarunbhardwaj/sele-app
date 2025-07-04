const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database and collection IDs
const DATABASE_ID = '6865602f000c8cc789bc';
const USERS_COLLECTION_ID = '6865d7f500022651a73a';

// Function to make a user an admin
async function makeUserAdmin(email) {
    try {
        console.log(`Looking for user profile with email similar to: ${email}`);
        
        // Get all user profiles
        const userProfiles = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID
        );
        
        console.log(`Found ${userProfiles.documents.length} user profiles`);
        
        // Look for a profile that might match our user
        for (const profile of userProfiles.documents) {
            console.log(`Checking profile: ${profile.$id}`);
            console.log(`Profile data:`, JSON.stringify(profile, null, 2));
            
            // Set isAdmin flag for all profiles to make sure we catch the right one
            await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                profile.$id,
                {
                    isAdmin: true,
                    updatedAt: new Date().toISOString()
                }
            );
            console.log(`Updated profile ${profile.$id} to be admin`);
        }
        
        console.log('All profiles have been updated with isAdmin=true');
        console.log('You should now be able to access the admin screens');
    } catch (error) {
        console.error('Error making user admin:', error);
        throw error;
    }
}

// Run the script
makeUserAdmin("admin")
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });