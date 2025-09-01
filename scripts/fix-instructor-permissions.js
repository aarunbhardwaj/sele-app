const { Client, Databases, Permission, Role } = require('node-appwrite');

// Load environment variables
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;

const instructorCollections = [
    { 
        id: process.env.EXPO_PUBLIC_INSTRUCTOR_PROFILES_COLLECTION_ID, 
        name: 'instructor_profiles' 
    },
    { 
        id: process.env.EXPO_PUBLIC_CLASS_ASSIGNMENTS_COLLECTION_ID, 
        name: 'class_assignments' 
    },
    { 
        id: process.env.EXPO_PUBLIC_CLASS_SESSIONS_COLLECTION_ID, 
        name: 'class_sessions' 
    },
    { 
        id: process.env.EXPO_PUBLIC_STUDENT_RATINGS_COLLECTION_ID, 
        name: 'student_ratings' 
    },
    { 
        id: process.env.EXPO_PUBLIC_ONLINE_SESSIONS_COLLECTION_ID, 
        name: 'online_sessions' 
    },
    { 
        id: process.env.EXPO_PUBLIC_INSTRUCTOR_SCHEDULES_COLLECTION_ID, 
        name: 'instructor_schedules' 
    }
];

async function updateInstructorPermissions() {
    try {
        console.log('Updating instructor collection permissions...');
        
        for (const collection of instructorCollections) {
            if (!collection.id) {
                console.log(`Skipping ${collection.name} - no collection ID found`);
                continue;
            }
            
            console.log(`Updating permissions for ${collection.name} (${collection.id})`);
            
            try {
                // Define comprehensive permissions
                const permissions = [
                    // Any authenticated user can read
                    Permission.read(Role.users()),
                    
                    // Users can create their own records
                    Permission.create(Role.users()),
                    
                    // Users can update their own records
                    Permission.update(Role.users()),
                    
                    // Users can delete their own records
                    Permission.delete(Role.users()),
                    
                    // Admin role has full access
                    Permission.read(Role.team('admin')),
                    Permission.create(Role.team('admin')),
                    Permission.update(Role.team('admin')),
                    Permission.delete(Role.team('admin')),
                    
                    // Instructor role has full access
                    Permission.read(Role.team('instructor')),
                    Permission.create(Role.team('instructor')),
                    Permission.update(Role.team('instructor')),
                    Permission.delete(Role.team('instructor')),
                ];

                await databases.updateCollection(
                    DATABASE_ID,
                    collection.id,
                    collection.name,
                    permissions
                );
                
                console.log(`✅ Updated permissions for ${collection.name}`);
                
            } catch (error) {
                console.error(`❌ Error updating ${collection.name}:`, error.message);
            }
        }
        
        console.log('\n✅ Instructor permissions update completed!');
        
    } catch (error) {
        console.error('❌ Error updating instructor permissions:', error);
    }
}

updateInstructorPermissions();
