require('dotenv').config();
const { Client, Databases, Permission, Role } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68651f96001557986822')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = '6865602f000c8cc789bc';
const SCHOOLS_COLLECTION_ID = '68c7c1f5000503487f7a';

async function createSchoolsCollection() {
    try {
        console.log('Creating Schools collection...');
        
        // Create the schools collection
        const collection = await databases.createCollection(
            DATABASE_ID,
            SCHOOLS_COLLECTION_ID,
            'schools',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        console.log('Schools collection created successfully:', collection.name);

        // Create attributes for the schools collection
        const attributes = [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'address', type: 'string', size: 500, required: true },
            { key: 'city', type: 'string', size: 100, required: true },
            { key: 'state', type: 'string', size: 100, required: true },
            { key: 'country', type: 'string', size: 100, required: true },
            { key: 'zipCode', type: 'string', size: 20, required: true },
            { key: 'phone', type: 'string', size: 20, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'website', type: 'string', size: 255, required: false },
            { key: 'contactPerson', type: 'string', size: 255, required: true },
            { key: 'contactEmail', type: 'string', size: 255, required: true },
            { key: 'contactPhone', type: 'string', size: 20, required: true },
            { key: 'status', type: 'string', size: 20, required: true },
            { key: 'enrollmentCount', type: 'integer', required: false },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
            { key: 'logo', type: 'string', size: 255, required: false }
        ];

        console.log('Creating attributes...');
        
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        SCHOOLS_COLLECTION_ID,
                        attr.key,
                        attr.size,
                        attr.required
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        SCHOOLS_COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        DATABASE_ID,
                        SCHOOLS_COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                }
                console.log(`✓ Created attribute: ${attr.key}`);
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error creating attribute ${attr.key}:`, error.message);
            }
        }

        // Create indexes for better performance
        console.log('Creating indexes...');
        
        try {
            await databases.createIndex(
                DATABASE_ID,
                SCHOOLS_COLLECTION_ID,
                'nameIndex',
                'key',
                ['name']
            );
            console.log('✓ Created name index');
        } catch (error) {
            console.error('Error creating name index:', error.message);
        }

        try {
            await databases.createIndex(
                DATABASE_ID,
                SCHOOLS_COLLECTION_ID,
                'statusIndex',
                'key',
                ['status']
            );
            console.log('✓ Created status index');
        } catch (error) {
            console.error('Error creating status index:', error.message);
        }

        try {
            await databases.createIndex(
                DATABASE_ID,
                SCHOOLS_COLLECTION_ID,
                'cityIndex',
                'key',
                ['city']
            );
            console.log('✓ Created city index');
        } catch (error) {
            console.error('Error creating city index:', error.message);
        }

        console.log('Schools collection setup completed successfully!');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('Schools collection already exists, checking attributes...');
            // Collection already exists, you might want to check if all attributes exist
        } else {
            console.error('Error creating schools collection:', error);
        }
    }
}

// Run the script
createSchoolsCollection()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });