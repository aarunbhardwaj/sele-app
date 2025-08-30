interface AppConfig {
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;
  APPWRITE_DATABASE_ID: string;
  APPWRITE_STORAGE_BUCKET_ID: string;
  USERS_COLLECTION_ID: string;
  ROLES_COLLECTION_ID: string;
  COURSES_COLLECTION_ID: string;
  LESSONS_COLLECTION_ID: string;
  EXERCISES_COLLECTION_ID: string;
  USER_PROGRESS_COLLECTION_ID: string;
  LESSON_COMPLETIONS_COLLECTION_ID: string;
  USER_ACTIVITIES_COLLECTION_ID: string;
  QUIZZES_COLLECTION_ID: string;
  QUIZ_QUESTIONS_COLLECTION_ID: string;
  QUIZ_ATTEMPTS_COLLECTION_ID: string;
  SCHOOLS_COLLECTION_ID: string;
  CLASSES_COLLECTION_ID: string;
}

/**
 * Validates and returns the application configuration
 * Throws an error if required environment variables are missing
 */
export function getAppConfig(): AppConfig {
  const requiredVars = [
    'EXPO_PUBLIC_APPWRITE_ENDPOINT',
    'EXPO_PUBLIC_APPWRITE_PROJECT_ID', 
    'EXPO_PUBLIC_APPWRITE_DATABASE_ID',
    'EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID'
  ];

  // Check for required environment variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    APPWRITE_ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    APPWRITE_PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    APPWRITE_DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    APPWRITE_STORAGE_BUCKET_ID: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
    USERS_COLLECTION_ID: process.env.EXPO_PUBLIC_USERS_COLLECTION_ID || '6865d7f500022651a73a',
    ROLES_COLLECTION_ID: process.env.EXPO_PUBLIC_ROLES_COLLECTION_ID || '6867fe9a000b1af9bdb8',
    COURSES_COLLECTION_ID: process.env.EXPO_PUBLIC_COURSES_COLLECTION_ID || '6865dcb4001f03a2d904',
    LESSONS_COLLECTION_ID: process.env.EXPO_PUBLIC_LESSONS_COLLECTION_ID || '6865e600000561ebba31',
    EXERCISES_COLLECTION_ID: process.env.EXPO_PUBLIC_EXERCISES_COLLECTION_ID || '6865e601000911331884',
    USER_PROGRESS_COLLECTION_ID: process.env.EXPO_PUBLIC_USER_PROGRESS_COLLECTION_ID || '6865e602000810dc0714',
    LESSON_COMPLETIONS_COLLECTION_ID: process.env.EXPO_PUBLIC_LESSON_COMPLETIONS_COLLECTION_ID || '6865e603000c430c1275',
    USER_ACTIVITIES_COLLECTION_ID: process.env.EXPO_PUBLIC_USER_ACTIVITIES_COLLECTION_ID || '6865e6040018e12e103d',
    QUIZZES_COLLECTION_ID: process.env.EXPO_PUBLIC_QUIZZES_COLLECTION_ID || '688a4cf6000503487f6f',
    QUIZ_QUESTIONS_COLLECTION_ID: process.env.EXPO_PUBLIC_QUIZ_QUESTIONS_COLLECTION_ID || '688a4cf7002ab931bd1f',
    QUIZ_ATTEMPTS_COLLECTION_ID: process.env.EXPO_PUBLIC_QUIZ_ATTEMPTS_COLLECTION_ID || '688a4cf8003e6499f5a2',
    SCHOOLS_COLLECTION_ID: process.env.EXPO_PUBLIC_SCHOOLS_COLLECTION_ID || '68c7c1f5000503487f7a',
    CLASSES_COLLECTION_ID: process.env.EXPO_PUBLIC_CLASSES_COLLECTION_ID || '68b2b88600214308924a'
  };
}

// Singleton configuration instance
let config: AppConfig | null = null;

/**
 * Get the singleton configuration instance
 */
export function getConfig(): AppConfig {
  if (!config) {
    config = getAppConfig();
  }
  return config;
}

export default getConfig;