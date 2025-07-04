const { Client, Databases, ID, Query, Users } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

// Database and collection IDs
const DATABASE_ID = '6865602f000c8cc789bc';
const USERS_COLLECTION_ID = '6865d7f500022651a73a';
const ROLES_COLLECTION_ID = '6867fe9a000b1af9bdb8'; // Updated to correct roles collection ID

// Function to make a user an admin
async function makeUserAdmin(email) {
    try {
        console.log(`Looking for user with email: ${email}`);
        
        // List users and filter by email
        const userList = await users.list();
        
        // Find the user with the matching email
        const appwriteUser = userList.users.find(user => user.email === email);
        
        if (!appwriteUser) {
            console.error(`No user found with email: ${email}`);
            return;
        }
        
        console.log(`Found Appwrite user: ${appwriteUser.name} (${appwriteUser.$id})`);
        
        // Now get the user profile using the userId
        const userResponse = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('userId', appwriteUser.$id)]
        );

        let userProfile;
        if (userResponse.documents.length === 0) {
            console.log(`No profile found for user: ${email}. Creating one now...`);
            
            // Create a profile if it doesn't exist
            userProfile = await databases.createDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                ID.unique(),
                {
                    userId: appwriteUser.$id,
                    displayName: appwriteUser.name || '',
                    nativeLanguage: 'English',
                    englishLevel: 'beginner',
                    learningGoal: 'Improve my English skills',
                    dailyGoalMinutes: 15,
                    profileImage: '',
                    joinedDate: new Date().toISOString()
                }
            );
            
            console.log(`Created new profile for ${email}`);
        } else {
            userProfile = userResponse.documents[0];
            console.log(`Found existing profile for ${email}`);
        }

        // Check if roles collection exists and get admin role
        console.log(`Checking for admin role...`);
        let adminRole;
        
        try {
            const rolesResponse = await databases.listDocuments(
                DATABASE_ID,
                ROLES_COLLECTION_ID,
                [Query.equal('name', 'admin')]
            );
            
            if (rolesResponse.documents.length > 0) {
                adminRole = rolesResponse.documents[0];
                console.log(`Found existing admin role with ID: ${adminRole.$id}`);
            } else {
                // Create admin role
                console.log('Creating new admin role...');
                adminRole = await databases.createDocument(
                    DATABASE_ID,
                    ROLES_COLLECTION_ID,
                    ID.unique(),
                    {
                        name: 'admin',
                        permissions: [
                            'create:courses',
                            'edit:courses',
                            'delete:courses',
                            'manage:users',
                            'manage:roles',
                            'view:analytics'
                        ],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );
                console.log(`Admin role created with ID: ${adminRole.$id}`);
            }
        } catch (error) {
            console.error("Error with roles collection:", error.message);
            throw error;
        }

        // We'll manually add a reference to the admin panel in a way that your app logic can check
        console.log('Adding admin access to user profile...');
        
        // Add an isAdmin flag to the user profile
        const updateData = {
            isAdmin: true,
            updatedAt: new Date().toISOString()
        };

        // Assign admin role to user
        const updatedUser = await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userProfile.$id,
            updateData
        );

        console.log(`User ${email} has been made an admin successfully!`);
        console.log('IMPORTANT: You need to add the "isAdmin" attribute to your users collection in Appwrite');
        console.log('Go to your Appwrite console > Database > users_profiles > Attributes > Add Boolean Attribute named "isAdmin"');
        console.log('Then update _layout.tsx in (admin) folder to check for isAdmin instead of roles');
        return updatedUser;
    } catch (error) {
        console.error('Error making user admin:', error);
        console.log('\nIMPORTANT: This error likely means you need to add an "isAdmin" attribute to your users collection.');
        console.log('Go to your Appwrite console > Database > users_profiles > Attributes > Add Boolean Attribute named "isAdmin"\n');
        throw error;
    }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
    console.error('Please provide a user email as an argument');
    console.log('Usage: node make-admin.js user@example.com');
    process.exit(1);
}

// Run the script
makeUserAdmin(email)
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });