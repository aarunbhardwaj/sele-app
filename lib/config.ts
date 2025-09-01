import Constants from 'expo-constants';

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
  // Instructor module collection IDs
  INSTRUCTOR_PROFILES_COLLECTION_ID: string;
  CLASS_ASSIGNMENTS_COLLECTION_ID: string;
  CLASS_SESSIONS_COLLECTION_ID: string;
  STUDENT_RATINGS_COLLECTION_ID: string;
  ONLINE_SESSIONS_COLLECTION_ID: string;
  INSTRUCTOR_SCHEDULES_COLLECTION_ID: string;
}

/**
 * Get environment variable with multiple fallback methods
 */
function getEnvVar(name: string, fallback?: string): string {
  // Try multiple ways to access environment variables
  let value = 
    // Standard process.env
    process.env[name] ||
    // Expo Constants
    Constants.expoConfig?.extra?.[name] ||
    Constants.manifest?.extra?.[name] ||
    // Global process for development
    (global as any).__DEV__ && (global as any).process?.env?.[name] ||
    // Window process (web)
    // @ts-ignore
    (typeof window !== 'undefined' && window?.process?.env?.[name]);
  
  // If still no value, try without EXPO_PUBLIC_ prefix for Constants
  if (!value && name.startsWith('EXPO_PUBLIC_')) {
    const simpleName = name.replace('EXPO_PUBLIC_', '');
    value = Constants.expoConfig?.extra?.[simpleName] || 
            Constants.manifest?.extra?.[simpleName];
  }
  
  if (!value && !fallback) {
    console.error(`❌ Missing environment variable: ${name}`);
    console.log('Available process.env keys:', Object.keys(process.env || {}));
    console.log('Available Constants.expoConfig.extra:', Constants.expoConfig?.extra);
    console.log('Available Constants.manifest.extra:', Constants.manifest?.extra);
    
    // Don't throw error, use fallback values from .env file
    console.warn(`⚠️  Using hardcoded fallback for ${name}`);
  }
  
  const result = value || fallback;
  console.log(`${name}: ${result ? '✅ loaded' : '❌ missing'}`);
  return result!;
}

/**
 * Validates and returns the application configuration
 * Uses hardcoded values from your .env as ultimate fallbacks
 */
export function getAppConfig(): AppConfig {
  console.log('🔄 Loading Appwrite configuration...');
  
  try {
    const config = {
      APPWRITE_ENDPOINT: getEnvVar('EXPO_PUBLIC_APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'),
      APPWRITE_PROJECT_ID: getEnvVar('EXPO_PUBLIC_APPWRITE_PROJECT_ID', '68651f96001557986822'),
      APPWRITE_DATABASE_ID: getEnvVar('EXPO_PUBLIC_APPWRITE_DATABASE_ID', '6865602f000c8cc789bc'),
      APPWRITE_STORAGE_BUCKET_ID: getEnvVar('EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID', '6866ba6d0018928bb361'),
      USERS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_USERS_COLLECTION_ID', '6865d7f500022651a73a'),
      ROLES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_ROLES_COLLECTION_ID', '6867fe9a000b1af9bdb8'),
      COURSES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_COURSES_COLLECTION_ID', '6865dcb4001f03a2d904'),
      LESSONS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_LESSONS_COLLECTION_ID', '6865e600000561ebba31'),
      EXERCISES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_EXERCISES_COLLECTION_ID', '6865e601000911331884'),
      USER_PROGRESS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_USER_PROGRESS_COLLECTION_ID', '6865e602000810dc0714'),
      LESSON_COMPLETIONS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_LESSON_COMPLETIONS_COLLECTION_ID', '6865e603000c430c1275'),
      USER_ACTIVITIES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_USER_ACTIVITIES_COLLECTION_ID', '6865e6040018e12e103d'),
      QUIZZES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_QUIZZES_COLLECTION_ID', '688a4cf6000503487f6f'),
      QUIZ_QUESTIONS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_QUIZ_QUESTIONS_COLLECTION_ID', '688a4cf7002ab931bd1f'),
      QUIZ_ATTEMPTS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_QUIZ_ATTEMPTS_COLLECTION_ID', '688a4cf8003e6499f5a2'),
      SCHOOLS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_SCHOOLS_COLLECTION_ID', '68c7c1f5000503487f7a'),
      CLASSES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_CLASSES_COLLECTION_ID', '68b2b4f2003cf2f9be30'),
      // Instructor module collection IDs
      INSTRUCTOR_PROFILES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_INSTRUCTOR_PROFILES_COLLECTION_ID', '68b440bb00333552369f'),
      CLASS_ASSIGNMENTS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_CLASS_ASSIGNMENTS_COLLECTION_ID', '68b440c2000d5d7e08ad'),
      CLASS_SESSIONS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_CLASS_SESSIONS_COLLECTION_ID', '68b440c700292daa4dda'),
      STUDENT_RATINGS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_STUDENT_RATINGS_COLLECTION_ID', '68b440cd001f7de5e982'),
      ONLINE_SESSIONS_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_ONLINE_SESSIONS_COLLECTION_ID', '68b440d1003219713fb2'),
      INSTRUCTOR_SCHEDULES_COLLECTION_ID: getEnvVar('EXPO_PUBLIC_INSTRUCTOR_SCHEDULES_COLLECTION_ID', '68b440d60002a2546d33'),
    };

    console.log('✅ Configuration loaded successfully');
    console.log('🗄️ Database ID:', config.APPWRITE_DATABASE_ID);
    console.log('🆔 Project ID:', config.APPWRITE_PROJECT_ID);
    
    // Final validation
    if (!config.APPWRITE_DATABASE_ID || config.APPWRITE_DATABASE_ID === 'undefined') {
      throw new Error('APPWRITE_DATABASE_ID is still undefined after loading');
    }
    
    if (!config.APPWRITE_PROJECT_ID || config.APPWRITE_PROJECT_ID === 'undefined') {
      throw new Error('APPWRITE_PROJECT_ID is still undefined after loading');
    }
    
    return config;
  } catch (error) {
    console.error('❌ Failed to load configuration:', error);
    throw error;
  }
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