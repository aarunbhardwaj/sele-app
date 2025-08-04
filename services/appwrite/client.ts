import { Account, Client, Databases, Storage } from 'appwrite';

// Initialize Appwrite client
const appwriteEndpoint = 'https://cloud.appwrite.io/v1';
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID || '68651f96001557986822';

// Database and collection IDs - make sure these match what's in Appwrite console
export const DATABASE_ID = '6865602f000c8cc789bc';
export const USERS_COLLECTION_ID = '6865d7f500022651a73a';
export const ROLES_COLLECTION_ID = '6867fe9a000b1af9bdb8';
export const COURSES_COLLECTION_ID = '6865dcb4001f03a2d904';
export const LESSONS_COLLECTION_ID = '6865e600000561ebba31';
export const EXERCISES_COLLECTION_ID = '6865e601000911331884';
export const USER_PROGRESS_COLLECTION_ID = '6865e602000810dc0714';
export const LESSON_COMPLETIONS_COLLECTION_ID = '6865e603000c430c1275';
export const USER_ACTIVITIES_COLLECTION_ID = '6865e6040018e12e103d';
export const QUIZZES_COLLECTION_ID = '688a4cf6000503487f6f';
export const QUIZ_QUESTIONS_COLLECTION_ID = '688a4cf7002ab931bd1f';
export const QUIZ_ATTEMPTS_COLLECTION_ID = '688a4cf8003e6499f5a2';

// Storage bucket ID - using the environment variable with a fallback
export const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || '6866ba6d0018928bb361';

// Initialize the client
const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;