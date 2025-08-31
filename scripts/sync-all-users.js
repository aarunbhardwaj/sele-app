const { Client, Databases, Users, ID, Query } = require('node-appwrite');
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

async function syncAllUsers() {
    try {
        console.log('🔄 Starting comprehensive user sync...');
        
        // Get all auth users
        console.log('📥 Fetching all auth users...');
        const authUsers = await users.list();
        console.log(`Found ${authUsers.users.length} auth users`);
        
        // Get all existing profiles
        console.log('📥 Fetching existing profiles...');
        const existingProfiles = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.limit(1000)]
        );
        
        const existingUserIds = existingProfiles.documents.map(profile => profile.userId);
        console.log(`Found ${existingUserIds.length} existing profiles`);
        
        // Find users without profiles
        const usersWithoutProfiles = authUsers.users.filter(user => 
            !existingUserIds.includes(user.$id)
        );
        
        console.log(`Found ${usersWithoutProfiles.length} users without profiles`);
        
        if (usersWithoutProfiles.length === 0) {
            console.log('✅ All users already have profiles!');
            return;
        }
        
        // Create profiles for users without them
        let createdCount = 0;
        for (const user of usersWithoutProfiles) {
            try {
                console.log(`Creating profile for: ${user.name} (${user.email})`);
                
                await databases.createDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        displayName: user.name || 'User',
                        email: user.email,
                        nativeLanguage: 'English',
                        englishLevel: 'beginner',
                        learningGoal: 'Improve my English skills',
                        profileImage: '',
                        dailyGoalMinutes: 15,
                        isAdmin: false,
                        roles: '',
                        isInstructor: false,
                        joinedDate: user.$createdAt || new Date().toISOString(),
                        lastActive: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        phone: null,
                        location: '',
                        bio: ''
                    }
                );
                
                createdCount++;
                console.log(`✅ Created profile for ${user.name}`);
                
            } catch (error) {
                console.error(`❌ Failed to create profile for ${user.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Sync completed! Created ${createdCount} profiles out of ${usersWithoutProfiles.length} missing profiles.`);
        
        // Verify final count
        const finalProfiles = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.limit(1000)]
        );
        
        console.log(`📊 Total profiles now: ${finalProfiles.documents.length}`);
        console.log(`📊 Total auth users: ${authUsers.users.length}`);
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// Run the sync
console.log('Starting user profile sync script...');
syncAllUsers();