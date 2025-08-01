import { Account, Client, Databases, ID, Permission, Query, Role, Storage } from 'appwrite';

// Initialize Appwrite client
const appwriteEndpoint = 'https://cloud.appwrite.io/v1';
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID || '68651f96001557986822';

// Database and collection IDs - make sure these match what's in Appwrite console
const DATABASE_ID = '6865602f000c8cc789bc';
const USERS_COLLECTION_ID = '6865d7f500022651a73a';
const ROLES_COLLECTION_ID = '6867fe9a000b1af9bdb8'; // Updated to correct roles collection ID
const COURSES_COLLECTION_ID = '6865dcb4001f03a2d904';
const LESSONS_COLLECTION_ID = '6865e600000561ebba31';
const EXERCISES_COLLECTION_ID = '6865e601000911331884';
const USER_PROGRESS_COLLECTION_ID = '6865e602000810dc0714';
const LESSON_COMPLETIONS_COLLECTION_ID = '6865e603000c430c1275';
const USER_ACTIVITIES_COLLECTION_ID = '6865e6040018e12e103d';
// Updated quiz collection IDs to match what's in your Appwrite console
const QUIZZES_COLLECTION_ID = '688a4cf6000503487f6f'; // Replace with your actual collection ID
const QUIZ_QUESTIONS_COLLECTION_ID = '688a4cf7002ab931bd1f'; // Replace with your actual collection ID
const QUIZ_ATTEMPTS_COLLECTION_ID = '688a4cf8003e6499f5a2'; // Replace with your actual collection ID
const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'profile_images'; // Now loaded from .env

// Initialize the client
const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId);

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Role management methods
const roleManagement = {
  // Create a new role
  createRole: async (name: string, permissions: string[]) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        ROLES_COLLECTION_ID,
        ID.unique(),
        {
          name,
          permissions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Appwrite service :: createRole :: error', error);
      throw error;
    }
  },

  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ROLES_COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllRoles :: error', error);
      throw error;
    }
  },

  // Update a role
  updateRole: async (roleId: string, data: { name?: string; permissions?: string[] }) => {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to update roles');
      }
      
      // Add explicit permissions when updating document
      return await databases.updateDocument(
        DATABASE_ID,
        ROLES_COLLECTION_ID,
        roleId,
        updateData,
        [
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
    } catch (error) {
      console.error('Appwrite service :: updateRole :: error', error);
      throw error;
    }
  },

  // Delete a role
  deleteRole: async (roleId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        ROLES_COLLECTION_ID,
        roleId
      );
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteRole :: error', error);
      throw error;
    }
  },

  // Assign role to user
  assignRoleToUser: async (userId: string, roleId: string) => {
    try {
      // Update user profile with role
      const userProfile = await appwriteService.getUserProfile(userId);
      if (userProfile) {
        // Store roles as comma-separated string instead of array
        const currentRoles = userProfile.roles || '';
        let newRoles = currentRoles;
        
        // If current roles is empty, just use the roleId
        if (!currentRoles) {
          newRoles = roleId;
        } 
        // If it already has roles, append the new one with a comma
        else if (!currentRoles.includes(roleId)) {
          newRoles = currentRoles + ',' + roleId;
        }
        
        return await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userProfile.$id,
          {
            roles: newRoles,
            updatedAt: new Date().toISOString()
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
      }
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Appwrite service :: assignRoleToUser :: error', error);
      throw error;
    }
  },

  // Remove role from user
  removeRoleFromUser: async (userId: string, roleId: string) => {
    try {
      const userProfile = await appwriteService.getUserProfile(userId);
      if (userProfile) {
        // Handle roles as string
        const currentRoles = userProfile.roles || '';
        const rolesArray = currentRoles.split(',').filter(id => id.trim() !== '');
        const updatedRolesArray = rolesArray.filter(id => id !== roleId);
        const updatedRoles = updatedRolesArray.join(',');
        
        return await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userProfile.$id,
          {
            roles: updatedRoles,
            updatedAt: new Date().toISOString()
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
      }
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Appwrite service :: removeRoleFromUser :: error', error);
      throw error;
    }
  },

  // Get user roles
  getUserRoles: async (userId: string) => {
    try {
      const userProfile = await appwriteService.getUserProfile(userId);
      if (userProfile && userProfile.roles) {
        // Convert from string to array
        const rolesArray = userProfile.roles.split(',').filter(id => id.trim() !== '');
        
        if (rolesArray.length > 0) {
          // Only try to fetch roles if they exist
          const roles = await Promise.all(
            rolesArray.map(roleId => 
              databases.getDocument(DATABASE_ID, ROLES_COLLECTION_ID, roleId)
            )
          );
          return roles;
        }
      }
      return [];
    } catch (error) {
      console.error('Appwrite service :: getUserRoles :: error', error);
      // Return empty array instead of throwing to make the function more resilient
      return [];
    }
  }
};

export const appwriteService = {
  // Create a new account
  createAccount: async (email: string, password: string, name: string) => {
    try {
      const response = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (response.$id) {
        // Account creation successful, now log in
        return await appwriteService.login(email, password);
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {
      console.error('Appwrite service :: createAccount :: error', error);
      throw error;
    }
  },

  // Login to account - updated to use emailPasswordLogin for version 18.1.1
  login: async (email: string, password: string) => {
    try {
      // Using correct method for SDK version 18.1.1
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error('Appwrite service :: login :: error', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch (error) {
      // This is often normal for guest users, so we'll handle it gracefully
      if (error.toString().includes('missing scope')) {
        console.log('User is not authenticated yet');
      } else {
        console.error('Appwrite service :: getCurrentUser :: error', error);
      }
      return null;
    }
  },

  // Get user account details including admin status
  getUserAccount: async () => {
    try {
      // First get the current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('No user is logged in');
      }
      
      // Then get the user profile with additional information like isAdmin
      const userProfile = await appwriteService.getUserProfile(currentUser.$id);
      
      return userProfile;
    } catch (error) {
      console.error('Appwrite service :: getUserAccount :: error', error);
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const session = await account.getSession('current');
      return !!session;
    } catch (error) {
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite service :: logout :: error', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      // Use the app URL scheme for mobile apps
      return await account.createRecovery(
        email,
        'react-tutorial://'  // Your app's URL scheme
      );
    } catch (error) {
      console.error('Appwrite service :: resetPassword :: error', error);
      throw error;
    }
  },

  // Update password with recovery code
  completePasswordRecovery: async (userId: string, secret: string, password: string, confirmPassword: string) => {
    try {
      return await account.updateRecovery(
        userId,
        secret,
        password,
        confirmPassword
      );
    } catch (error) {
      console.error('Appwrite service :: completePasswordRecovery :: error', error);
      throw error;
    }
  },

  // User profile methods
  createUserProfile: async (userId, userData) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          displayName: userData.displayName,
          profileImage: userData.profileImage || '',
          nativeLanguage: userData.nativeLanguage,
          englishLevel: userData.englishLevel || 'beginner',
          learningGoal: userData.learningGoal || '',
          dailyGoalMinutes: userData.dailyGoalMinutes || 15,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Appwrite service :: createUserProfile :: error', error);
      throw error;
    }
  },
  
  getUserProfile: async (userId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      return response.documents[0];
    } catch (error) {
      console.error('Appwrite service :: getUserProfile :: error', error);
      throw error;
    }
  },
  
  updateUserProfile: async (documentId, userData) => {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        userData
      );
    } catch (error) {
      console.error('Appwrite service :: updateUserProfile :: error', error);
      throw error;
    }
  },
  
  // Course methods
  getAllCourses: async (filters = []) => {
    console.log('getAllCourses: Starting request to Appwrite...');
    console.log('Database ID:', DATABASE_ID);
    console.log('Courses Collection ID:', COURSES_COLLECTION_ID);
    
    try {
      console.log('Sending listDocuments request with filters:', filters);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        filters
      );
      
      console.log('getAllCourses: Request successful, received', response.documents.length, 'courses');
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllCourses :: error:', error);
      
      // More detailed error logging
      if (error.code) {
        console.error('Error code:', error.code);
      }
      
      if (error.response) {
        console.error('Response details:', error.response);
      }
      
      // Check for common issues
      if (error.message && error.message.includes('Collection not found')) {
        console.error('Collection not found. Please check your COURSES_COLLECTION_ID:', COURSES_COLLECTION_ID);
      } else if (error.message && error.message.includes('Database not found')) {
        console.error('Database not found. Please check your DATABASE_ID:', DATABASE_ID);
      }
      
      throw error;
    }
  },
  
  createCourse: async (courseData) => {
    try {
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a course');
      }
      
      console.log('Current User:', currentUser.$id);
      
      // Get user profile - we primarily rely on isAdmin flag
      const userProfile = await appwriteService.getUserProfile(currentUser.$id);
      
      // Check permissions - simplify to just check isAdmin flag
      // since our roles functionality isn't fully implemented yet
      if (!userProfile || userProfile.isAdmin !== true) {
        throw new Error('User does not have permission to create courses');
      }
      
      // Ensure totalLessons is properly converted to a number
      let totalLessonsValue = 0;
      if (courseData.totalLessons !== undefined && courseData.totalLessons !== null) {
        // Handle if it's already a number or a string that needs conversion
        totalLessonsValue = typeof courseData.totalLessons === 'number' 
          ? courseData.totalLessons 
          : parseInt(courseData.totalLessons, 10);
      }
      
      // Create the document payload - omit creatorId as it's not in the schema
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        level: courseData.level || 'beginner',
        category: courseData.category || 'general',
        totalLessons: totalLessonsValue,
        estimatedDuration: courseData.estimatedDuration || courseData.duration || '4 weeks',
        isPublished: courseData.isPublished || false,
        imageUrl: courseData.imageUrl || '',
        // Store creator info as metadata if needed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add tags if present

      
      // Debug logging
      console.log('Course payload being sent to Appwrite:', JSON.stringify(coursePayload, null, 2));
      console.log('totalLessons value and type:', coursePayload.totalLessons, typeof coursePayload.totalLessons);
      
      // Create the document with explicit permissions
      const result = await databases.createDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        ID.unique(),
        coursePayload,
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id))
        ]
      );
      
      console.log('Course created successfully:', result.$id);
      
      return result;
    } catch (error) {
      console.error('Appwrite service :: createCourse :: error', error);
      throw error;
    }
  },
  
  updateCourse: async (courseId, courseData) => {
    try {
      // Prepare data for update - handle field mismatches
      const updateData = { ...courseData };
      
      // Convert totalLessons to a number if present
      if (updateData.totalLessons !== undefined) {
        updateData.totalLessons = typeof updateData.totalLessons === 'number'
          ? updateData.totalLessons
          : parseInt(updateData.totalLessons, 10);
      }
      
      // Handle duration/estimatedDuration field name mismatch
      if (updateData.duration && !updateData.estimatedDuration) {
        updateData.estimatedDuration = updateData.duration;
        delete updateData.duration; // Remove the duration field as it's not in the schema
      }
      
      // Remove tags field as it's not in the Appwrite schema
      if (updateData.tags) {
        delete updateData.tags;
      }
      
      // Add updated timestamp
      updateData.updatedAt = new Date().toISOString();
      
      // Log the update data for debugging
      console.log('Course update data:', JSON.stringify(updateData, null, 2));
      
      return await databases.updateDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId,
        updateData
      );
    } catch (error) {
      console.error('Appwrite service :: updateCourse :: error', error);
      throw error;
    }
  },
  
  deleteCourse: async (courseId) => {
    try {
      // First, check if there are any lessons associated with this course
      const associatedLessons = await databases.listDocuments(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        [Query.equal('courseId', courseId)]
      );
      
      // Delete all associated lessons first
      if (associatedLessons.documents.length > 0) {
        for (const lesson of associatedLessons.documents) {
          // Also delete any exercises associated with this lesson
          const associatedExercises = await databases.listDocuments(
            DATABASE_ID,
            EXERCISES_COLLECTION_ID,
            [Query.equal('lessonId', lesson.$id)]
          );
          
          for (const exercise of associatedExercises.documents) {
            await databases.deleteDocument(
              DATABASE_ID,
              EXERCISES_COLLECTION_ID,
              exercise.$id
            );
          }
          
          // Delete the lesson
          await databases.deleteDocument(
            DATABASE_ID,
            LESSONS_COLLECTION_ID,
            lesson.$id
          );
        }
      }
      
      // Finally delete the course
      await databases.deleteDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId
      );
      
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteCourse :: error', error);
      throw error;
    }
  },
  
  getCoursesByLevel: async (level) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        [Query.equal('level', level), Query.equal('isPublished', true)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getCoursesByLevel :: error', error);
      throw error;
    }
  },
  
  getCourseById: async (courseId) => {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId
      );
    } catch (error) {
      console.error('Appwrite service :: getCourseById :: error', error);
      throw error;
    }
  },
  
  // Lesson methods
  getLessonsByCourse: async (courseId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        [
          Query.equal('courseId', courseId),
          Query.equal('isPublished', true),
          Query.orderAsc('order')
        ]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getLessonsByCourse :: error', error);
      throw error;
    }
  },
  
  createLesson: async (lessonData) => {
    try {
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a lesson');
      }
      
      // Get the course to determine order for new lesson
      const courseLessons = await appwriteService.getLessonsByCourse(lessonData.courseId);
      
      // Calculate next order number (max order + 1 or 1 if no lessons)
      const nextOrder = courseLessons.length > 0 
        ? Math.max(...courseLessons.map(lesson => lesson.order || 0)) + 1 
        : 1;
      
      // Convert duration to integer minutes if it's a string
      let durationInMinutes = 15; // Default 15 minutes
      if (lessonData.duration) {
        if (typeof lessonData.duration === 'number') {
          durationInMinutes = lessonData.duration;
        } else if (typeof lessonData.duration === 'string') {
          // Try to extract number from string like "15 minutes"
          const match = lessonData.duration.match(/(\d+)/);
          if (match && match[1]) {
            durationInMinutes = parseInt(match[1], 10);
          }
        }
      }
      
      // Create the document payload
      const lessonPayload = {
        title: lessonData.title,
        content: lessonData.content || '',
        description: lessonData.description || lessonData.content?.substring(0, 100) + '...' || 'No description provided',
        courseId: lessonData.courseId,
        order: lessonData.order || nextOrder,
        isPublished: lessonData.isPublished || false,
        duration: durationInMinutes // Integer value
      };
      
      console.log('Creating lesson with payload:', lessonPayload);
      
      // Create the document with permissions
      const result = await databases.createDocument(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        ID.unique(),
        lessonPayload
      );
      
      return result;
    } catch (error) {
      console.error('Appwrite service :: createLesson :: error', error);
      throw error;
    }
  },
  
  updateLesson: async (lessonId, lessonData) => {
    try {
      // Add updated timestamp
      const updateData = {
        ...lessonData,
        updatedAt: new Date().toISOString()
      };
      
      return await databases.updateDocument(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        lessonId,
        updateData
      );
    } catch (error) {
      console.error('Appwrite service :: updateLesson :: error', error);
      throw error;
    }
  },
  
  deleteLesson: async (lessonId) => {
    try {
      // First, check if there are any exercises associated with this lesson
      const associatedExercises = await databases.listDocuments(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID,
        [Query.equal('lessonId', lessonId)]
      );
      
      // Delete all associated exercises first
      if (associatedExercises.documents.length > 0) {
        for (const exercise of associatedExercises.documents) {
          await databases.deleteDocument(
            DATABASE_ID,
            EXERCISES_COLLECTION_ID,
            exercise.$id
          );
        }
      }
      
      // Now delete the lesson
      await databases.deleteDocument(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        lessonId
      );
      
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteLesson :: error', error);
      throw error;
    }
  },
  
  getLessonById: async (lessonId) => {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        lessonId
      );
    } catch (error) {
      console.error('Appwrite service :: getLessonById :: error', error);
      throw error;
    }
  },
  
  // Exercise methods
  getExercisesByLesson: async (lessonId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID,
        [Query.equal('lessonId', lessonId)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getExercisesByLesson :: error', error);
      throw error;
    }
  },
  
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
  
  // Media storage methods
  uploadMedia: async (file, permissions = []) => {
    try {
      console.log('File object received for upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        hasUri: !!file.uri,
        hasSource: !!file.source
      });

      try {
        // Format required by Appwrite for React Native uploads
        const uploadedFile = await storage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          file,  // Pass the entire file object directly
          [Permission.read(Role.any())]
        );
        
        console.log('File uploaded successfully:', uploadedFile.$id);
        return uploadedFile;
      } catch (error) {
        if (error.message && error.message.includes('Storage bucket not found')) {
          console.error('Storage bucket not found. Please create a bucket named "profile_images" in your Appwrite console.');
          throw new Error('Storage bucket not found. Please create a bucket named "profile_images" in your Appwrite console.');
        } else {
          console.error('Upload error details:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Appwrite service :: uploadMedia :: error', error);
      throw error;
    }
  },
  
  getFilePreview: (fileId) => {
    try {
      // Use getFileView instead of getFilePreview for a direct URL
      const previewUrl = storage.getFileView(STORAGE_BUCKET_ID, fileId);
      console.log('File preview URL:', previewUrl.toString());
      return previewUrl;
    } catch (error) {
      console.error('Appwrite service :: getFilePreview :: error', error);
      return null;
    }
  },
  
  deleteFile: async (fileId) => {
    try {
      await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteFile :: error', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllUsers :: error', error);
      throw error;
    }
  },

  // Role management methods - adding these to the main appwriteService object
  createRole: roleManagement.createRole,
  getAllRoles: roleManagement.getAllRoles,
  updateRole: roleManagement.updateRole,
  deleteRole: roleManagement.deleteRole,
  assignRoleToUser: roleManagement.assignRoleToUser,
  removeRoleFromUser: roleManagement.removeRoleFromUser,
  getUserRoles: roleManagement.getUserRoles,

  // Course instructor methods
  assignInstructorToCourse: async (courseId: string, instructorId: string) => {
    try {
      // Get the course first
      const course = await appwriteService.getCourseById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Update the course with the instructor ID
      return await databases.updateDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId,
        {
          instructorId: instructorId,
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Appwrite service :: assignInstructorToCourse :: error', error);
      throw error;
    }
  },
  
  removeInstructorFromCourse: async (courseId: string) => {
    try {
      // Get the course first
      const course = await appwriteService.getCourseById(courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Update the course to remove the instructor
      return await databases.updateDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId,
        {
          instructorId: null, // Set to null to remove the instructor
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Appwrite service :: removeInstructorFromCourse :: error', error);
      throw error;
    }
  },
  
  getInstructors: async () => {
    try {
      // Get all users with instructor role (assuming there's an isInstructor field)
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('isInstructor', true)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getInstructors :: error', error);
      throw error;
    }
  },

  // Advanced instructor management methods
  getInstructorsByCourse: async (courseId: string) => {
    try {
      // Get the course first to check for instructor ID
      const course = await appwriteService.getCourseById(courseId);
      
      if (!course || !course.instructorId) {
        // No instructor assigned to this course
        return [];
      }
      
      // Get instructor details
      const instructor = await appwriteService.getUserProfile(course.instructorId);
      
      return instructor ? [instructor] : [];
    } catch (error) {
      console.error('Appwrite service :: getInstructorsByCourse :: error', error);
      return [];
    }
  },
  
  addInstructorToCourse: async (courseId: string, instructorData: any) => {
    try {
      // Check if the instructor exists by email
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', instructorData.email)]
      );
      
      let instructorId;
      
      // If instructor exists, use their ID
      if (existingUsers.documents.length > 0) {
        instructorId = existingUsers.documents[0].userId;
      } else {
        // Create a new user with instructor role if not exists
        const newUser = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: ID.unique(),
            displayName: instructorData.displayName,
            email: instructorData.email,
            profileImage: instructorData.profileImage || '',
            isInstructor: true,
            joinedDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }
        );
        
        instructorId = newUser.userId;
      }
      
      // Assign instructor to course
      await appwriteService.assignInstructorToCourse(courseId, instructorId);
      
      return { success: true };
    } catch (error) {
      console.error('Appwrite service :: addInstructorToCourse :: error', error);
      throw error;
    }
  },

  getEligibleInstructors: async () => {
    try {
      // Get all users that are either instructors or admins
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.or([
          Query.equal('isInstructor', true),
          Query.equal('isAdmin', true)
        ])]
      );
      
      // Sort users by displayName for easier selection
      return response.documents.sort((a, b) => {
        if (a.displayName && b.displayName) {
          return a.displayName.localeCompare(b.displayName);
        }
        return 0;
      });
    } catch (error) {
      console.error('Appwrite service :: getEligibleInstructors :: error', error);
      return [];
    }
  },

  // Quiz methods
  getAllQuizzes: async (filters = []) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUIZZES_COLLECTION_ID,
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
      return await databases.getDocument(
        DATABASE_ID,
        QUIZZES_COLLECTION_ID,
        quizId
      );
    } catch (error) {
      console.error('Appwrite service :: getQuizById :: error', error);
      throw error;
    }
  },

  createQuiz: async (quizData) => {
    try {
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a quiz');
      }
      
      // Get user profile to check admin status
      const userProfile = await appwriteService.getUserProfile(currentUser.$id);
      
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
      const result = await databases.createDocument(
        DATABASE_ID,
        QUIZZES_COLLECTION_ID,
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
      // Add updated timestamp
      const updateData = {
        ...quizData,
        updatedAt: new Date().toISOString()
      };
      
      return await databases.updateDocument(
        DATABASE_ID,
        QUIZZES_COLLECTION_ID,
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
      // First, delete all associated questions
      const associatedQuestions = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_QUESTIONS_COLLECTION_ID,
        [Query.equal('quizId', quizId)]
      );
      
      if (associatedQuestions.documents.length > 0) {
        for (const question of associatedQuestions.documents) {
          await databases.deleteDocument(
            DATABASE_ID,
            QUIZ_QUESTIONS_COLLECTION_ID,
            question.$id
          );
        }
      }
      
      // Now delete the quiz
      await databases.deleteDocument(
        DATABASE_ID,
        QUIZZES_COLLECTION_ID,
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
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_QUESTIONS_COLLECTION_ID,
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
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a question');
      }
      
      // Get questions to determine next order number
      const quizQuestions = await appwriteService.getQuestionsByQuiz(questionData.quizId);
      
      // Calculate next order number
      const nextOrder = quizQuestions.length > 0 
        ? Math.max(...quizQuestions.map(question => question.order || 0)) + 1 
        : 1;
      
      // Create the document payload
      const questionPayload = {
        quizId: questionData.quizId,
        text: questionData.text,
        type: questionData.type || 'multiple-choice',
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation || '',
        points: questionData.points || 1,
        order: questionData.order || nextOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Create the document with permissions
      const result = await databases.createDocument(
        DATABASE_ID,
        QUIZ_QUESTIONS_COLLECTION_ID,
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
      // Add updated timestamp
      const updateData = {
        ...questionData,
        updatedAt: new Date().toISOString()
      };
      
      return await databases.updateDocument(
        DATABASE_ID,
        QUIZ_QUESTIONS_COLLECTION_ID,
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
      await databases.deleteDocument(
        DATABASE_ID,
        QUIZ_QUESTIONS_COLLECTION_ID,
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
      return await databases.createDocument(
        DATABASE_ID,
        QUIZ_ATTEMPTS_COLLECTION_ID,
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
      // If quizId is provided, get attempts for that specific quiz
      const filters = [Query.equal('userId', userId)];
      
      if (quizId) {
        filters.push(Query.equal('quizId', quizId));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_ATTEMPTS_COLLECTION_ID,
        filters
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getUserQuizAttempts :: error', error);
      throw error;
    }
  },

  // ... continue with existing methods ...
};

export default appwriteService;