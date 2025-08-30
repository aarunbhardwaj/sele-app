import { Account, Client, Databases, Storage } from 'appwrite';
import { getConfig } from '../../lib/config';

// Get configuration
const config = getConfig();

// Export configuration constants
export const DATABASE_ID = config.APPWRITE_DATABASE_ID;
export const USERS_COLLECTION_ID = config.USERS_COLLECTION_ID;
export const ROLES_COLLECTION_ID = config.ROLES_COLLECTION_ID;
export const COURSES_COLLECTION_ID = config.COURSES_COLLECTION_ID;
export const LESSONS_COLLECTION_ID = config.LESSONS_COLLECTION_ID;
export const EXERCISES_COLLECTION_ID = config.EXERCISES_COLLECTION_ID;
export const USER_PROGRESS_COLLECTION_ID = config.USER_PROGRESS_COLLECTION_ID;
export const LESSON_COMPLETIONS_COLLECTION_ID = config.LESSON_COMPLETIONS_COLLECTION_ID;
export const USER_ACTIVITIES_COLLECTION_ID = config.USER_ACTIVITIES_COLLECTION_ID;
export const QUIZZES_COLLECTION_ID = config.QUIZZES_COLLECTION_ID;
export const QUIZ_QUESTIONS_COLLECTION_ID = config.QUIZ_QUESTIONS_COLLECTION_ID;
export const QUIZ_ATTEMPTS_COLLECTION_ID = config.QUIZ_ATTEMPTS_COLLECTION_ID;
export const SCHOOLS_COLLECTION_ID = config.SCHOOLS_COLLECTION_ID;
export const STORAGE_BUCKET_ID = config.APPWRITE_STORAGE_BUCKET_ID;

// Initialize the client
const client = new Client()
    .setEndpoint(config.APPWRITE_ENDPOINT)
    .setProject(config.APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;