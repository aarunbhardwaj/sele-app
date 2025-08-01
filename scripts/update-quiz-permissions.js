// This script updates the permissions on the Quizzes collection to allow any authenticated user
// to create, read, update, and delete quizzes, instead of requiring admin team membership

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
const QUIZZES_COLLECTION_ID = '688a4cf6000503487f6f';
const QUIZ_QUESTIONS_COLLECTION_ID = '688a4cf7002ab931bd1f';

async function updateQuizCollectionsPermissions() {
    try {
        console.log('Updating Quizzes collection permissions...');
        
        // Get current collection info
        const quizzesCollection = await databases.getCollection(
            DATABASE_ID,
            QUIZZES_COLLECTION_ID
        );
        
        console.log('Current quizzes permissions:', quizzesCollection.permissions);
        
        // Update the quizzes collection permissions to allow any authenticated user to manage quizzes
        const updatedQuizzesCollection = await databases.updateCollection(
            DATABASE_ID,
            QUIZZES_COLLECTION_ID,
            quizzesCollection.name,
            [
                Permission.read(Role.users()), // All authenticated users can read
                Permission.create(Role.users()), // All authenticated users can create
                Permission.update(Role.users()), // All authenticated users can update
                Permission.delete(Role.users())  // All authenticated users can delete
            ]
        );
        
        console.log('Quizzes collection permissions updated successfully.');
        console.log('New permissions:', updatedQuizzesCollection.permissions);
        
        // Now update quiz questions collection permissions
        console.log('Updating Quiz Questions collection permissions...');
        
        const questionsCollection = await databases.getCollection(
            DATABASE_ID,
            QUIZ_QUESTIONS_COLLECTION_ID
        );
        
        console.log('Current quiz questions permissions:', questionsCollection.permissions);
        
        // Update the quiz questions collection permissions
        const updatedQuestionsCollection = await databases.updateCollection(
            DATABASE_ID,
            QUIZ_QUESTIONS_COLLECTION_ID,
            questionsCollection.name,
            [
                Permission.read(Role.users()), // All authenticated users can read
                Permission.create(Role.users()), // All authenticated users can create
                Permission.update(Role.users()), // All authenticated users can update
                Permission.delete(Role.users())  // All authenticated users can delete
            ]
        );
        
        console.log('Quiz Questions collection permissions updated successfully.');
        console.log('New permissions:', updatedQuestionsCollection.permissions);
        
        return {
            quizzes: updatedQuizzesCollection,
            questions: updatedQuestionsCollection
        };
    } catch (error) {
        console.error('Error updating collections permissions:', error);
        throw error;
    }
}

// Run the update function
updateQuizCollectionsPermissions()
    .then(() => console.log('Done! Users can now manage quizzes without being in an admin team.'))
    .catch(err => console.error('Failed:', err));