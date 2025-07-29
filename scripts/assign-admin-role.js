// This script fixes the relationship between user profiles with isAdmin=true
// and the roles collection by creating an admin role with appropriate permissions
// and assigning it to all admin users

const { Client, Databases, ID, Permission, Role, Query } = require('node-appwrite');
require('dotenv').config();

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database and collection IDs - make sure these match what's in the main app
const DATABASE_ID = '6865602f000c8cc789bc';
const USERS_COLLECTION_ID = '6865d7f500022651a73a';
const ROLES_COLLECTION_ID = '6867fe9a000b1af9bdb8';

// Helper function to check if an attribute exists in the collection
async function checkAttributeExists(collectionId, attributeName) {
    try {
        const attributes = await databases.listAttributes(DATABASE_ID, collectionId);
        return attributes.attributes.some(attr => attr.key === attributeName);
    } catch (error) {
        console.error(`Error checking attribute ${attributeName}:`, error);
        return false;
    }
}

// Helper function to create the roles attribute if it doesn't exist
async function createRolesAttributeIfNeeded() {
    try {
        console.log('Checking if roles attribute exists in users collection...');
        const hasRolesAttribute = await checkAttributeExists(USERS_COLLECTION_ID, 'roles');
        
        if (!hasRolesAttribute) {
            console.log('Creating roles attribute in users collection...');
            // Create a roles array attribute in the users collection
            await databases.createStringAttribute(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                'roles',
                255, // size - max length of each string in the array
                true, // array
                null, // default value (null for arrays)
                false, // required - false to avoid issues with existing docs
                false // isUnique - false to allow users to have the same role
            );
            
            console.log('Roles attribute created successfully.');
            
            // Wait for the attribute to be available
            console.log('Waiting for attribute to be indexed (10 seconds)...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
            console.log('Roles attribute already exists.');
        }
        
        return true;
    } catch (error) {
        console.error('Error creating roles attribute:', error);
        throw error;
    }
}

async function createAdminRoleIfNotExists() {
    try {
        console.log('Looking for admin role...');
        const roles = await databases.listDocuments(
            DATABASE_ID,
            ROLES_COLLECTION_ID,
            [Query.equal('name', 'admin')]
        );

        let adminRoleId;
        
        // Create admin role if it doesn't exist
        if (roles.documents.length === 0) {
            console.log('Admin role not found, creating it...');
            const permissions = [
                'create:courses',
                'update:courses',
                'delete:courses',
                'create:lessons',
                'update:lessons',
                'delete:lessons',
                'create:exercises',
                'update:exercises',
                'delete:exercises',
                'manage:users',
                'view:analytics'
            ];
            
            const adminRole = await databases.createDocument(
                DATABASE_ID,
                ROLES_COLLECTION_ID,
                ID.unique(),
                {
                    name: 'admin',
                    permissions,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );
            
            adminRoleId = adminRole.$id;
            console.log(`Admin role created with ID: ${adminRoleId}`);
        } else {
            adminRoleId = roles.documents[0].$id;
            console.log(`Admin role already exists with ID: ${adminRoleId}`);
        }
        
        return adminRoleId;
    } catch (error) {
        console.error('Error creating admin role:', error);
        throw error;
    }
}

async function findAdminUsers() {
    try {
        console.log('Finding users with isAdmin=true...');
        const adminUsers = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('isAdmin', true)]
        );
        
        console.log(`Found ${adminUsers.documents.length} admin users.`);
        return adminUsers.documents;
    } catch (error) {
        console.error('Error finding admin users:', error);
        throw error;
    }
}

async function assignRoleToUsers(adminUsers, adminRoleId) {
    try {
        console.log(`Assigning admin role to ${adminUsers.length} users...`);
        
        for (const user of adminUsers) {
            try {
                // Get current roles or empty array if null
                const currentRoles = user.roles || [];
                
                // Check if user already has this role
                const hasRole = currentRoles.includes(adminRoleId);
                
                if (!hasRole) {
                    // Update user with role - removed updatedAt field
                    const updatedUser = await databases.updateDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        user.$id,
                        {
                            roles: [...currentRoles, adminRoleId]
                        }
                    );
                    
                    console.log(`Assigned admin role to user: ${user.userId}`);
                } else {
                    console.log(`User ${user.userId} already has admin role.`);
                }
            } catch (error) {
                console.error(`Error assigning role to user ${user.userId}:`, error);
                throw error;
            }
        }
        
        console.log('Role assignment complete.');
    } catch (error) {
        console.error('Error assigning roles to users:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('Starting admin role assignment process...');
        
        // First, create the roles attribute if needed
        await createRolesAttributeIfNeeded();
        
        // Create admin role if needed
        const adminRoleId = await createAdminRoleIfNotExists();
        
        // Find all users with isAdmin=true
        const adminUsers = await findAdminUsers();
        
        if (adminUsers.length === 0) {
            console.log('No admin users found. Please make sure users have isAdmin=true in their profiles.');
            return;
        }
        
        // Assign admin role to all admin users
        await assignRoleToUsers(adminUsers, adminRoleId);
        
        console.log('Successfully linked admin users with admin role.');
    } catch (error) {
        console.error('Failed to complete admin role assignment:', error);
    }
}

// Run the main function
main();