import { ID, Query } from 'appwrite';
import { Course, Instructor, Lesson } from '../../lib/types';
import { getAppwriteClient } from './client';

class CourseService {
  /**
   * Get all courses with pagination
   */
  async getAllCourses(limit = 25, offset = 0): Promise<Course[]> {
    try {
      console.log('getAllCourses: Starting request to Appwrite...');
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.coursesCollectionId,
        [Query.limit(limit), Query.offset(offset)]
      );
      console.log(`getAllCourses: Request successful, received ${response.documents.length} courses`);
      return response.documents as unknown as Course[];
    } catch (error) {
      console.error('Error getting all courses:', error);
      throw error;
    }
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: Omit<Course, '$id' | '$createdAt' | '$updatedAt'>): Promise<Course> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.createDocument(
        config.databaseId,
        config.coursesCollectionId,
        ID.unique(),
        courseData
      );
      return response as unknown as Course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.updateDocument(
        config.databaseId,
        config.coursesCollectionId,
        courseId,
        courseData
      );
      return response as unknown as Course;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const { databases, config } = getAppwriteClient();
      await databases.deleteDocument(
        config.databaseId,
        config.coursesCollectionId,
        courseId
      );
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Get courses by level
   */
  async getCoursesByLevel(level: string): Promise<Course[]> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.coursesCollectionId,
        [Query.equal('level', level)]
      );
      return response.documents as unknown as Course[];
    } catch (error) {
      console.error('Error getting courses by level:', error);
      throw error;
    }
  }

  /**
   * Get a single course by its ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.getDocument(
        config.databaseId,
        config.coursesCollectionId,
        courseId
      );
      return response as unknown as Course;
    } catch (error) {
      console.error(`Error getting course by ID ${courseId}:`, error);
      return null;
    }
  }

  /**
   * Get all lessons for a specific course
   */
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.lessonsCollectionId,
        [Query.equal('courseId', courseId)]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error('Error getting lessons by course:', error);
      throw error;
    }
  }

  /**
   * Create a new lesson
   */
  async createLesson(lessonData: Omit<Lesson, '$id' | '$createdAt' | '$updatedAt'>): Promise<Lesson> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.createDocument(
        config.databaseId,
        config.lessonsCollectionId,
        ID.unique(),
        lessonData
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.updateDocument(
        config.databaseId,
        config.lessonsCollectionId,
        lessonId,
        lessonData
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: string): Promise<void> {
    try {
      const { databases, config } = getAppwriteClient();
      await databases.deleteDocument(
        config.databaseId,
        config.lessonsCollectionId,
        lessonId
      );
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }

  /**
   * Get a single lesson by its ID
   */
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.getDocument(
        config.databaseId,
        config.lessonsCollectionId,
        lessonId
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error(`Error getting lesson by ID ${lessonId}:`, error);
      return null;
    }
  }

  /**
   * Get all exercises for a specific lesson
   */
  async getExercisesByLesson(lessonId: string): Promise<any[]> {
    // Assuming you have an EXERCISES_COLLECTION_ID
    // This is a placeholder implementation
    console.warn('getExercisesByLesson is not fully implemented');
    return [];
  }

  /**
   * Assign an instructor to a course
   */
  async assignInstructorToCourse(courseId: string, instructorId: string): Promise<Course> {
    try {
      // First, get the current instructors
      const course = await this.getCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Add the new instructor if not already present
      const instructors = course.instructors || [];
      if (!instructors.includes(instructorId)) {
        instructors.push(instructorId);
      }
      
      // Update the course
      return await this.updateCourse(courseId, { instructors });
    } catch (error) {
      console.error('Error assigning instructor to course:', error);
      throw error;
    }
  }

  /**
   * Remove an instructor from a course
   */
  async removeInstructorFromCourse(courseId: string, instructorId: string): Promise<Course> {
    try {
      const course = await this.getCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      const instructors = (course.instructors || []).filter(id => id !== instructorId);
      
      return await this.updateCourse(courseId, { instructors });
    } catch (error) {
      console.error('Error removing instructor from course:', error);
      throw error;
    }
  }

  /**
   * Get all instructors
   */
  async getInstructors(): Promise<Instructor[]> {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.usersCollectionId,
        [Query.equal('isInstructor', true)]
      );
      return response.documents as unknown as Instructor[];
    } catch (error) {
      console.error('Error getting instructors:', error);
      throw error;
    }
  }

  /**
   * Get instructors assigned to a specific course
   */
  async getInstructorsByCourse(courseId: string): Promise<Instructor[]> {
    try {
      const course = await this.getCourseById(courseId);
      if (!course || !course.instructors || course.instructors.length === 0) {
        return [];
      }
      
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.usersCollectionId,
        [Query.equal('$id', course.instructors)]
      );
      
      return response.documents as unknown as Instructor[];
    } catch (error) {
      console.error('Error getting instructors by course:', error);
      throw error;
    }
  }

  /**
   * Add an instructor to a course (idempotent)
   */
  async addInstructorToCourse(courseId: string, instructorId: string): Promise<Course> {
    return this.assignInstructorToCourse(courseId, instructorId);
  }

  /**
   * Get eligible instructors (users with isInstructor flag)
   */
  async getEligibleInstructors(): Promise<Instructor[]> {
    return this.getInstructors();
  }
}

export const courseService = new CourseService();