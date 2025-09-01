import { ID, Query } from 'appwrite';
// Use shared constants and databases instance from one import
import { Class } from '../../lib/types';
import {
    CLASSES_COLLECTION_ID,
    DATABASE_ID,
    databases,
} from './client';

export class ClassService {
  /**
   * Create a new class
   */
  async createClass(classData: Omit<Class, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>): Promise<Class> {
    try {
      const now = new Date().toISOString();
      const document = await databases.createDocument(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        ID.unique(),
        {
          ...classData,
          enrolledStudents: JSON.stringify(classData.enrolledStudents || []),
          waitingList: JSON.stringify(classData.waitingList || []),
          currentEnrollment: classData.currentEnrollment || 0,
          isActive: classData.isActive ?? true,
          createdAt: now,
          updatedAt: now
        }
      );

      return this.transformDocument(document);
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  /**
   * Get class by ID
   */
  async getClass(classId: string): Promise<Class> {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        classId
      );

      return this.transformDocument(document);
    } catch (error) {
      console.error('Error getting class:', error);
      throw error;
    }
  }

  /**
   * Get all classes for a specific school
   */
  async getClassesBySchool(schoolId: string, filters?: {
    status?: string;
    enrollmentStatus?: string;
    subject?: string;
    grade?: string;
    isActive?: boolean;
  }): Promise<Class[]> {
    try {
      const queries = [Query.equal('schoolId', schoolId)];

      if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
      }
      if (filters?.enrollmentStatus) {
        queries.push(Query.equal('enrollmentStatus', filters.enrollmentStatus));
      }
      if (filters?.subject) {
        queries.push(Query.equal('subject', filters.subject));
      }
      if (filters?.grade) {
        queries.push(Query.equal('grade', filters.grade));
      }
      if (filters?.isActive !== undefined) {
        queries.push(Query.equal('isActive', filters.isActive));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        queries
      );

      return response.documents.map(doc => this.transformDocument(doc));
    } catch (error) {
      console.error('Error getting classes by school:', error);
      throw error;
    }
  }

  /**
   * Get available classes for student enrollment (for signup flow)
   */
  async getAvailableClassesForEnrollment(schoolId: string, filters?: {
    subject?: string;
    grade?: string;
  }): Promise<Class[]> {
    try {
      const queries = [
        Query.equal('schoolId', schoolId),
        Query.equal('isActive', true),
        Query.equal('enrollmentStatus', 'open'),
        Query.equal('status', 'active')
      ];

      if (filters?.subject) {
        queries.push(Query.equal('subject', filters.subject));
      }
      if (filters?.grade) {
        queries.push(Query.equal('grade', filters.grade));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        queries
      );

      return response.documents.map(doc => this.transformDocument(doc));
    } catch (error) {
      console.error('Error getting available classes for enrollment:', error);
      throw error;
    }
  }

  /**
   * Get classes by instructor
   */
  async getClassesByInstructor(instructorId: string): Promise<Class[]> {
    try {
      console.log('Getting classes by instructor:', instructorId);
      console.log('Using databaseId (dynamic):', DATABASE_ID);
      console.log('Using collectionId (dynamic):', CLASSES_COLLECTION_ID);
      
      // Add validation for database and collection IDs
      if (!DATABASE_ID || !CLASSES_COLLECTION_ID) {
        console.error('Missing database or collection configuration');
        console.error('databaseId:', DATABASE_ID);
        console.error('collectionId:', CLASSES_COLLECTION_ID);
        return [];
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        [Query.equal('instructorId', instructorId)]
      );

      return response.documents.map(doc => this.transformDocument(doc));
    } catch (error) {
      console.error('Error getting classes by instructor:', error);
      // Return empty array instead of throwing to prevent infinite loops
      return [];
    }
  }

  /**
   * Update class information
   */
  async updateClass(classId: string, updates: Partial<Class>): Promise<Class> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Handle array fields that need to be stringified
      if (updates.enrolledStudents) {
        updateData.enrolledStudents = JSON.stringify(updates.enrolledStudents);
      }
      if (updates.waitingList) {
        updateData.waitingList = JSON.stringify(updates.waitingList);
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.$id;
      delete updateData.$createdAt;
      delete updateData.$updatedAt;
      delete updateData.$permissions;

      const document = await databases.updateDocument(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        classId,
        updateData
      );

      return this.transformDocument(document);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  /**
   * Enroll a student in a class
   */
  async enrollStudent(classId: string, studentId: string): Promise<Class> {
    try {
      const classData = await this.getClass(classId);
      
      // Check if student is already enrolled
      if (classData.enrolledStudents?.includes(studentId)) {
        throw new Error('Student is already enrolled in this class');
      }

      // Check if class is full
      if (classData.maxStudents && classData.currentEnrollment && 
          classData.currentEnrollment >= classData.maxStudents) {
        
        if (classData.allowWaitlist) {
          // Add to waiting list
          const waitingList = classData.waitingList || [];
          if (!waitingList.includes(studentId)) {
            waitingList.push(studentId);
            return this.updateClass(classId, { waitingList });
          } else {
            throw new Error('Student is already on the waiting list');
          }
        } else {
          throw new Error('Class is full and waiting list is not allowed');
        }
      }

      // Enroll the student
      const enrolledStudents = classData.enrolledStudents || [];
      enrolledStudents.push(studentId);
      
      return this.updateClass(classId, {
        enrolledStudents,
        currentEnrollment: enrolledStudents.length
      });
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  /**
   * Remove a student from a class
   */
  async unenrollStudent(classId: string, studentId: string): Promise<Class> {
    try {
      const classData = await this.getClass(classId);
      
      // Remove from enrolled students
      const enrolledStudents = (classData.enrolledStudents || []).filter(id => id !== studentId);
      
      // Remove from waiting list if present
      const waitingList = (classData.waitingList || []).filter(id => id !== studentId);

      return this.updateClass(classId, {
        enrolledStudents,
        waitingList,
        currentEnrollment: enrolledStudents.length
      });
    } catch (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  }

  /**
   * Assign instructor to a class
   */
  async assignInstructor(classId: string, instructorId: string, instructorName?: string): Promise<Class> {
    try {
      return this.updateClass(classId, {
        instructorId,
        instructorName
      });
    } catch (error) {
      console.error('Error assigning instructor:', error);
      throw error;
    }
  }

  /**
   * Get student's enrolled classes
   */
  async getStudentClasses(studentId: string): Promise<Class[]> {
    try {
      // Since we can't directly query JSON array fields in Appwrite,
      // we need to get all classes and filter client-side
      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        [Query.equal('isActive', true)]
      );

      const allClasses = response.documents.map(doc => this.transformDocument(doc));
      
      return allClasses.filter(classItem => 
        classItem.enrolledStudents?.includes(studentId)
      );
    } catch (error) {
      console.error('Error getting student classes:', error);
      throw error;
    }
  }

  /**
   * Get classes by subject and grade (for course auto-assignment)
   */
  async getClassesBySubjectAndGrade(subject: string, grade: string, schoolId?: string): Promise<Class[]> {
    try {
      const queries = [
        Query.equal('subject', subject),
        Query.equal('grade', grade),
        Query.equal('isActive', true)
      ];

      if (schoolId) {
        queries.push(Query.equal('schoolId', schoolId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        queries
      );

      return response.documents.map(doc => this.transformDocument(doc));
    } catch (error) {
      console.error('Error getting classes by subject and grade:', error);
      throw error;
    }
  }

  /**
   * Delete a class
   */
  async deleteClass(classId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        classId
      );
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  /**
   * Get class enrollment statistics
   */
  async getClassStats(classId: string): Promise<{
    totalEnrolled: number;
    waitingListCount: number;
    availableSpots: number;
    enrollmentRate: number;
  }> {
    try {
      const classData = await this.getClass(classId);
      
      const totalEnrolled = classData.currentEnrollment || 0;
      const waitingListCount = classData.waitingList?.length || 0;
      const maxStudents = classData.maxStudents || 0;
      const availableSpots = Math.max(0, maxStudents - totalEnrolled);
      const enrollmentRate = maxStudents > 0 ? (totalEnrolled / maxStudents) * 100 : 0;

      return {
        totalEnrolled,
        waitingListCount,
        availableSpots,
        enrollmentRate
      };
    } catch (error) {
      console.error('Error getting class stats:', error);
      throw error;
    }
  }

  /**
   * Search classes by title or code
   */
  async searchClasses(searchTerm: string, schoolId?: string): Promise<Class[]> {
    try {
      const queries = [Query.equal('isActive', true)];
      
      if (schoolId) {
        queries.push(Query.equal('schoolId', schoolId));
      }

      // Add search queries
      queries.push(Query.search('title', searchTerm));

      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASSES_COLLECTION_ID,
        queries
      );

      return response.documents.map(doc => this.transformDocument(doc));
    } catch (error) {
      console.error('Error searching classes:', error);
      throw error;
    }
  }

  /**
   * Transform Appwrite document to Class object
   */
  private transformDocument(document: any): Class {
    return {
      $id: document.$id,
      $createdAt: document.$createdAt,
      $updatedAt: document.$updatedAt,
      $permissions: document.$permissions,
      title: document.title,
      description: document.description,
      code: document.code,
      schoolId: document.schoolId,
      courseId: document.courseId,
      instructorId: document.instructorId,
      instructorName: document.instructorName,
      subject: document.subject,
      grade: document.grade,
      section: document.section,
      level: document.level,
      academicYear: document.academicYear,
      semester: document.semester,
      maxStudents: document.maxStudents,
      currentEnrollment: document.currentEnrollment,
      enrolledStudents: document.enrolledStudents ? JSON.parse(document.enrolledStudents) : [],
      waitingList: document.waitingList ? JSON.parse(document.waitingList) : [],
      allowWaitlist: document.allowWaitlist,
      schedule: document.schedule,
      meetingDays: document.meetingDays,
      startTime: document.startTime,
      endTime: document.endTime,
      duration: document.duration,
      timezone: document.timezone,
      room: document.room,
      status: document.status,
      enrollmentStatus: document.enrollmentStatus,
      type: document.type,
      isPublic: document.isPublic,
      requiresApproval: document.requiresApproval,
      isActive: document.isActive,
      meetingUrl: document.meetingUrl,
      meetingId: document.meetingId,
      meetingPassword: document.meetingPassword,
      startDate: document.startDate,
      endDate: document.endDate,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }
}

export const classService = new ClassService();