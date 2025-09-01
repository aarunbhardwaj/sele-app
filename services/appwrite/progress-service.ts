import { ID, Query } from 'appwrite';
import { getAppwriteClient } from './client';

const progressService = {
  // User Progress methods
  getUserProgress: async (userId) => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.userProgressCollectionId,
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
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.userProgressCollectionId,
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
      const { databases, config } = getAppwriteClient();
      return await databases.createDocument(
        config.databaseId,
        config.userProgressCollectionId,
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
      const { databases, config } = getAppwriteClient();
      return await databases.updateDocument(
        config.databaseId,
        config.userProgressCollectionId,
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
      const { databases, config } = getAppwriteClient();
      return await databases.createDocument(
        config.databaseId,
        config.lessonCompletionsCollectionId,
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
      const { databases, config } = getAppwriteClient();
      return await databases.createDocument(
        config.databaseId,
        config.userActivitiesCollectionId,
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