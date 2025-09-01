import { ID, Permission, Query, Role } from 'appwrite';
import authService from './auth-service';
import { getAppwriteClient } from './client';

const quizService = {
  // Quiz methods
  getAllQuizzes: async (filters = []) => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.quizzesCollectionId,
        filters
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllQuizzes :: error', error);
      throw error;
    }
  },

  getQuizById: async (quizId) => {
    try {
      const { databases, config } = getAppwriteClient();
      return await databases.getDocument(
        config.databaseId,
        config.quizzesCollectionId,
        quizId
      );
    } catch (error) {
      console.error('Appwrite service :: getQuizById :: error', error);
      throw error;
    }
  },

  createQuiz: async (quizData) => {
    try {
      const { account } = getAppwriteClient();
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a quiz');
      }
      
      // Get user profile to check admin status
      const userProfile = await authService.getUserProfile(currentUser.$id);
      
      // Check permissions
      if (!userProfile || userProfile.isAdmin !== true) {
        throw new Error('User does not have permission to create quizzes');
      }
      
      // Create the document payload
      const quizPayload = {
        title: quizData.title,
        description: quizData.description || '',
        category: quizData.category || 'general',
        difficulty: quizData.difficulty || 'beginner',
        timeLimit: quizData.timeLimit || 0, // 0 means no time limit
        passScore: quizData.passScore || 70, // Default pass score (percentage)
        isPublished: quizData.isPublished || false,
        createdBy: currentUser.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add courseId if it exists in the quizData
        ...(quizData.courseId && { courseId: quizData.courseId }),
      };
      
      // Create the document with permissions
      const { databases, config } = getAppwriteClient();
      const result = await databases.createDocument(
        config.databaseId,
        config.quizzesCollectionId,
        ID.unique(),
        quizPayload,
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id))
        ]
      );
      
      return result;
    } catch (error) {
      console.error('Appwrite service :: createQuiz :: error', error);
      throw error;
    }
  },

  updateQuiz: async (quizId, quizData) => {
    try {
      const { databases, config } = getAppwriteClient();
      // Add updated timestamp
      const updateData = {
        ...quizData,
        updatedAt: new Date().toISOString()
      };
      
      return await databases.updateDocument(
        config.databaseId,
        config.quizzesCollectionId,
        quizId,
        updateData
      );
    } catch (error) {
      console.error('Appwrite service :: updateQuiz :: error', error);
      throw error;
    }
  },

  deleteQuiz: async (quizId) => {
    try {
      const { databases, config } = getAppwriteClient();
      // First, delete all associated questions
      const associatedQuestions = await databases.listDocuments(
        config.databaseId,
        config.quizQuestionsCollectionId,
        [Query.equal('quizId', quizId)]
      );
      
      if (associatedQuestions.documents.length > 0) {
        for (const question of associatedQuestions.documents) {
          await databases.deleteDocument(
            config.databaseId,
            config.quizQuestionsCollectionId,
            question.$id
          );
        }
      }
      
      // Now delete the quiz
      await databases.deleteDocument(
        config.databaseId,
        config.quizzesCollectionId,
        quizId
      );
      
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteQuiz :: error', error);
      throw error;
    }
  },

  // Quiz question methods
  getQuestionsByQuiz: async (quizId) => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.quizQuestionsCollectionId,
        [
          Query.equal('quizId', quizId),
          Query.orderAsc('order')
        ]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getQuestionsByQuiz :: error', error);
      throw error;
    }
  },

  createQuestion: async (questionData) => {
    try {
      const { account } = getAppwriteClient();
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a question');
      }
      
      // Get questions to determine next order number
      const quizQuestions = await quizService.getQuestionsByQuiz(questionData.quizId);
      
      // Calculate next order number
      const nextOrder = quizQuestions.length > 0 
        ? Math.max(...quizQuestions.map(question => question.order || 0)) + 1 
        : 1;
      
      console.log('Creating question with data:', JSON.stringify(questionData, null, 2));
      
      // Create the document payload - use correctOption field to match the database schema
      const questionPayload = {
        quizId: questionData.quizId,
        text: questionData.text,
        type: questionData.type || 'multiple-choice',
        options: questionData.options || [],
        // Use correctOption field to match the actual database schema
        correctOption: questionData.correctAnswer !== undefined ? questionData.correctAnswer : questionData.correctOption,
        explanation: questionData.explanation || '',
        points: questionData.points || 1,
        order: questionData.order || nextOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Sending question payload to Appwrite:', JSON.stringify(questionPayload, null, 2));
      
      // Create the document with permissions
      const { databases, config } = getAppwriteClient();
      const result = await databases.createDocument(
        config.databaseId,
        config.quizQuestionsCollectionId,
        ID.unique(),
        questionPayload
      );
      
      return result;
    } catch (error) {
      console.error('Appwrite service :: createQuestion :: error', error);
      throw error;
    }
  },

  updateQuestion: async (questionId, questionData) => {
    try {
      const { databases, config } = getAppwriteClient();
      // Add updated timestamp
      const updateData = {
        ...questionData,
        updatedAt: new Date().toISOString()
      };
      
      return await databases.updateDocument(
        config.databaseId,
        config.quizQuestionsCollectionId,
        questionId,
        updateData
      );
    } catch (error) {
      console.error('Appwrite service :: updateQuestion :: error', error);
      throw error;
    }
  },

  deleteQuestion: async (questionId) => {
    try {
      const { databases, config } = getAppwriteClient();
      await databases.deleteDocument(
        config.databaseId,
        config.quizQuestionsCollectionId,
        questionId
      );
      
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteQuestion :: error', error);
      throw error;
    }
  },

  // Quiz attempt methods
  recordQuizAttempt: async (userId, quizId, attemptData) => {
    try {
      const { databases, config } = getAppwriteClient();
      return await databases.createDocument(
        config.databaseId,
        config.quizAttemptsCollectionId,
        ID.unique(),
        {
          userId: userId,
          quizId: quizId,
          startedAt: attemptData.startedAt || new Date().toISOString(),
          completedAt: attemptData.completedAt || null,
          score: attemptData.score || 0,
          totalQuestions: attemptData.totalQuestions || 0,
          correctAnswers: attemptData.correctAnswers || 0,
          timeSpent: attemptData.timeSpent || 0,
          answers: attemptData.answers || [],
          passed: attemptData.passed || false,
        }
      );
    } catch (error) {
      console.error('Appwrite service :: recordQuizAttempt :: error', error);
      throw error;
    }
  },

  getUserQuizAttempts: async (userId, quizId = null) => {
    try {
      const { databases, config } = getAppwriteClient();
      // If quizId is provided, get attempts for that specific quiz
      const filters = [Query.equal('userId', userId)];
      
      if (quizId) {
        filters.push(Query.equal('quizId', quizId));
      }
      
      const response = await databases.listDocuments(
        config.databaseId,
        config.quizAttemptsCollectionId,
        filters
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getUserQuizAttempts :: error', error);
      throw error;
    }
  },
};

export default quizService;