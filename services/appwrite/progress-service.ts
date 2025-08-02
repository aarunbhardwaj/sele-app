import { ID, Query } from 'appwrite';
import { DATABASE_ID, databases, LESSON_COMPLETIONS_COLLECTION_ID, USER_ACTIVITIES_COLLECTION_ID, USER_PROGRESS_COLLECTION_ID } from './client';

const progressService = {
  // User Progress methods
  getUserProgress: async (userId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getUserProgress :: error', error);
      throw error;
    }
  },
  
  getUserCourseProgress: async (userId, courseId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('courseId', courseId)
        ]
      );
      
      return response.documents[0];
    } catch (error) {
      console.error('Appwrite service :: getUserCourseProgress :: error', error);
      throw error;
    }
  },
  
  createUserProgress: async (userId, courseId) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          courseId: courseId,
          lastCompletedLesson: null,
          enrollmentDate: new Date().toISOString(),
          completedLessons: [],
          overallProgress: 0,
          totalPointsEarned: 0,
          lastAccessDate: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Appwrite service :: createUserProgress :: error', error);
      throw error;
    }
  },
  
  updateUserProgress: async (progressId, progressData) => {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        progressId,
        progressData
      );
    } catch (error) {
      console.error('Appwrite service :: updateUserProgress :: error', error);
      throw error;
    }
  },
  
  // Lesson completion methods
  recordLessonCompletion: async (userId, lessonId, completionData) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        LESSON_COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          lessonId: lessonId,
          completedAt: new Date().toISOString(),
          score: completionData.score,
          timeSpent: completionData.timeSpent,
          exercisesCompleted: completionData.exercisesCompleted,
          exercisesCorrect: completionData.exercisesCorrect,
        }
      );
    } catch (error) {
      console.error('Appwrite service :: recordLessonCompletion :: error', error);
      throw error;
    }
  },
  
  // User activity tracking
  trackUserActivity: async (userId, type, entityId, details = {}) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USER_ACTIVITIES_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          type: type,
          entityId: entityId,
          timestamp: new Date().toISOString(),
          details: details,
        }
      );
    } catch (error) {
      console.error('Appwrite service :: trackUserActivity :: error', error);
      throw error;
    }
  },
};

export default progressService;