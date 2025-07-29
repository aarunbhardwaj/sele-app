// This script checks the structure of the courses collection in Appwrite
// to identify all required attributes

const { Client, Databases } = require('node-appwrite');
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

async function checkCollectionStructure() {
    try {
        console.log('Checking courses collection structure...');
        
        // Get collection info
        const collection = await databases.getCollection(
            DATABASE_ID,
            COURSES_COLLECTION_ID
        );
        
        console.log('Collection details:');
        console.log(`Name: ${collection.name}`);
        console.log(`ID: ${collection.$id}`);
        
        // Get collection attributes
        const attributes = await databases.listAttributes(
            DATABASE_ID,
            COURSES_COLLECTION_ID
        );
        
        console.log('\nAttributes:');
        attributes.attributes.forEach(attr => {
            const requiredText = attr.required ? 'REQUIRED' : 'optional';
            const defaultValue = attr.default !== undefined ? `default: ${attr.default}` : 'no default';
            console.log(`- ${attr.key} (${attr.type}): ${requiredText}, ${defaultValue}`);
            
            // Show additional info for specific types
            if (attr.type === 'string') {
                console.log(`  Size: ${attr.size}, Format: ${attr.format || 'none'}`);
            }
        });
        
        // Try to get a sample document
        try {
            const documents = await databases.listDocuments(
                DATABASE_ID,
                COURSES_COLLECTION_ID,
                [],
                1
            );
            
            if (documents.documents.length > 0) {
                console.log('\nSample document:');
                console.log(JSON.stringify(documents.documents[0], null, 2));
            } else {
                console.log('\nNo documents found in collection');
            }
        } catch (error) {
            console.log('\nCould not fetch sample document:', error.message);
        }
        
    } catch (error) {
        console.error('Error checking collection structure:', error);
    }
}

// Run the check function
checkCollectionStructure()
    .then(() => console.log('Done checking courses collection structure'))
    .catch(err => console.error('Failed to check structure:', err));