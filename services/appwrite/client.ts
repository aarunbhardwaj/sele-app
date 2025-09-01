import { Account, Client, Databases, Storage } from 'appwrite';
import { getConfig } from '../../lib/config';

const config = getConfig();

const client = new Client();
client
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const {
  APPWRITE_DATABASE_ID: databaseId,
  USERS_COLLECTION_ID: usersCollectionId,
  ROLES_COLLECTION_ID: rolesCollectionId,
  COURSES_COLLECTION_ID: coursesCollectionId,
  LESSONS_COLLECTION_ID: lessonsCollectionId,
  EXERCISES_COLLECTION_ID: exercisesCollectionId,
  USER_PROGRESS_COLLECTION_ID: userProgressCollectionId,
  LESSON_COMPLETIONS_COLLECTION_ID: lessonCompletionsCollectionId,
  USER_ACTIVITIES_COLLECTION_ID: userActivitiesCollectionId,
  QUIZZES_COLLECTION_ID: quizzesCollectionId,
  QUIZ_QUESTIONS_COLLECTION_ID: quizQuestionsCollectionId,
  QUIZ_ATTEMPTS_COLLECTION_ID: quizAttemptsCollectionId,
  SCHOOLS_COLLECTION_ID: schoolsCollectionId,
  CLASSES_COLLECTION_ID: classesCollectionId,
  APPWRITE_STORAGE_BUCKET_ID: storageBucketId,
  INSTRUCTOR_PROFILES_COLLECTION_ID: instructorProfilesCollectionId,
  CLASS_ASSIGNMENTS_COLLECTION_ID: classAssignmentsCollectionId,
  CLASS_SESSIONS_COLLECTION_ID: classSessionsCollectionId,
  STUDENT_RATINGS_COLLECTION_ID: studentRatingsCollectionId,
  ONLINE_SESSIONS_COLLECTION_ID: onlineSessionsCollectionId,
  INSTRUCTOR_SCHEDULES_COLLECTION_ID: instructorSchedulesCollectionId,
} = config;

console.log('✅ Appwrite client initialized successfully');

// Helper function that some services expect
export function getAppwriteClient() {
  return {
    client,
    account,
    databases,
    storage,
    config: {
      databaseId,
      usersCollectionId,
      rolesCollectionId,
      coursesCollectionId,
      lessonsCollectionId,
      exercisesCollectionId,
      userProgressCollectionId,
      lessonCompletionsCollectionId,
      userActivitiesCollectionId,
      quizzesCollectionId,
      quizQuestionsCollectionId,
      quizAttemptsCollectionId,
      schoolsCollectionId,
      classesCollectionId,
      instructorProfilesCollectionId,
      classAssignmentsCollectionId,
      classSessionsCollectionId,
      studentRatingsCollectionId,
      onlineSessionsCollectionId,
      instructorSchedulesCollectionId,
      storageBucketId
    }
  };
}

export {
  classAssignmentsCollectionId,
  classesCollectionId,
  classSessionsCollectionId,
  client,
  coursesCollectionId,
  databaseId,
  exercisesCollectionId,
  instructorProfilesCollectionId,
  instructorSchedulesCollectionId,
  lessonCompletionsCollectionId,
  lessonsCollectionId,
  onlineSessionsCollectionId,
  quizAttemptsCollectionId,
  quizQuestionsCollectionId,
  quizzesCollectionId,
  rolesCollectionId,
  schoolsCollectionId,
  storageBucketId,
  studentRatingsCollectionId,
  userActivitiesCollectionId,
  userProgressCollectionId,
  usersCollectionId
};

// Export constants with uppercase naming for services that expect it
export const DATABASE_ID = databaseId;
export const CLASSES_COLLECTION_ID = classesCollectionId;
export const USERS_COLLECTION_ID = usersCollectionId;
export const COURSES_COLLECTION_ID = coursesCollectionId;
export const LESSONS_COLLECTION_ID = lessonsCollectionId;
export const EXERCISES_COLLECTION_ID = exercisesCollectionId;
export const USER_PROGRESS_COLLECTION_ID = userProgressCollectionId;
export const LESSON_COMPLETIONS_COLLECTION_ID = lessonCompletionsCollectionId;
export const USER_ACTIVITIES_COLLECTION_ID = userActivitiesCollectionId;
export const QUIZZES_COLLECTION_ID = quizzesCollectionId;
export const QUIZ_QUESTIONS_COLLECTION_ID = quizQuestionsCollectionId;
export const QUIZ_ATTEMPTS_COLLECTION_ID = quizAttemptsCollectionId;
export const SCHOOLS_COLLECTION_ID = schoolsCollectionId;
export const ROLES_COLLECTION_ID = rolesCollectionId;
export const INSTRUCTOR_PROFILES_COLLECTION_ID = instructorProfilesCollectionId;
export const CLASS_ASSIGNMENTS_COLLECTION_ID = classAssignmentsCollectionId;
export const CLASS_SESSIONS_COLLECTION_ID = classSessionsCollectionId;
export const STUDENT_RATINGS_COLLECTION_ID = studentRatingsCollectionId;
export const ONLINE_SESSIONS_COLLECTION_ID = onlineSessionsCollectionId;
export const INSTRUCTOR_SCHEDULES_COLLECTION_ID = instructorSchedulesCollectionId;
export const STORAGE_BUCKET_ID = storageBucketId;
