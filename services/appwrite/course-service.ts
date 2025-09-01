import { ID, Permission, Query, Role } from 'appwrite';
import authService from './auth-service';
import { getAppwriteClient } from './client';

// Retrieve Appwrite primitives and config
const { account, databases, config } = getAppwriteClient();

// Helper alias accessors for readability (still sourced from config)
const DATABASE_ID = config.databaseId;
const COURSES_COLLECTION_ID = config.coursesCollectionId;
const LESSONS_COLLECTION_ID = config.lessonsCollectionId;
const EXERCISES_COLLECTION_ID = config.exercisesCollectionId;
const USERS_COLLECTION_ID = config.usersCollectionId;

const courseService = {
  // Course methods
  getAllCourses: async (filters: any[] = []) => {
    console.log('getAllCourses: Starting request to Appwrite...');
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        filters
      );
      
      console.log('getAllCourses: Request successful, received', response.documents.length, 'courses');
      return response.documents;
    } catch (error: any) {
      console.error('Appwrite service :: getAllCourses :: error:', error);
      
      // More detailed error logging
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', error.code);
      }
      
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Response details:', error.response);
      }
      
      throw error;
    }
  },
  
  createCourse: async (courseData: any) => {
    try {
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a course');
      }
      
      console.log('Current User:', currentUser.$id);
      
      // Get user profile - we primarily rely on isAdmin flag
      const userProfile = await authService.getUserProfile(currentUser.$id);
      
      // Check permissions - simplify to just check isAdmin flag
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
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
    } catch (error: any) {
      console.error('Appwrite service :: createCourse :: error', error);
      throw error;
    }
  },
  
  updateCourse: async (courseId: string, courseData: any) => {
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
    } catch (error: any) {
      console.error('Appwrite service :: updateCourse :: error', error);
      throw error;
    }
  },
  
  deleteCourse: async (courseId: string) => {
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
    } catch (error: any) {
      console.error('Appwrite service :: deleteCourse :: error', error);
      throw error;
    }
  },
  
  getCoursesByLevel: async (level: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        [Query.equal('level', level), Query.equal('isPublished', true)]
      );
      
      return response.documents;
    } catch (error: any) {
      console.error('Appwrite service :: getCoursesByLevel :: error', error);
      throw error;
    }
  },
  
  getCourseById: async (courseId: string) => {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId
      );
    } catch (error: any) {
      console.error('Appwrite service :: getCourseById :: error', error);
      throw error;
    }
  },
  
  // Lesson methods
  getLessonsByCourse: async (courseId: string) => {
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
    } catch (error: any) {
      console.error('Appwrite service :: getLessonsByCourse :: error', error);
      throw error;
    }
  },
  
  createLesson: async (lessonData: any) => {
    try {
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to create a lesson');
      }
      
      // Get the course to determine order for new lesson
      const courseLessons = await courseService.getLessonsByCourse(lessonData.courseId);
      
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
    } catch (error: any) {
      console.error('Appwrite service :: createLesson :: error', error);
      throw error;
    }
  },
  
  updateLesson: async (lessonId: string, lessonData: any) => {
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
    } catch (error: any) {
      console.error('Appwrite service :: updateLesson :: error', error);
      throw error;
    }
  },
  
  deleteLesson: async (lessonId: string) => {
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
    } catch (error: any) {
      console.error('Appwrite service :: deleteLesson :: error', error);
      throw error;
    }
  },
  
  getLessonById: async (lessonId: string) => {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        lessonId
      );
    } catch (error: any) {
      console.error('Appwrite service :: getLessonById :: error', error);
      throw error;
    }
  },
  
  // Exercise methods
  getExercisesByLesson: async (lessonId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID,
        [Query.equal('lessonId', lessonId)]
      );
      
      return response.documents;
    } catch (error: any) {
      console.error('Appwrite service :: getExercisesByLesson :: error', error);
      throw error;
    }
  },

  // Course instructor methods
  assignInstructorToCourse: async (courseId: string, instructorId: string) => {
    try {
      // Get the course first
      const course = await courseService.getCourseById(courseId);
      
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
    } catch (error: any) {
      console.error('Appwrite service :: assignInstructorToCourse :: error', error);
      throw error;
    }
  },
  
  removeInstructorFromCourse: async (courseId: string) => {
    try {
      // Get the course first
      const course = await courseService.getCourseById(courseId);
      
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Appwrite service :: getInstructors :: error', error);
      throw error;
    }
  },

  getInstructorsByCourse: async (courseId: string) => {
    try {
      // Get the course first to check for instructor ID
      const course = await courseService.getCourseById(courseId);
      
      if (!course || !course.instructorId) {
        // No instructor assigned to this course
        return [];
      }
      
      // Get instructor details
      const instructor = await authService.getUserProfile(course.instructorId);
      
      return instructor ? [instructor] : [];
    } catch (error: any) {
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
      await courseService.assignInstructorToCourse(courseId, instructorId);
      
      return { success: true };
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Appwrite service :: getEligibleInstructors :: error', error);
      return [];
    }
  },
};

export default courseService;