import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, SCHOOLS_COLLECTION_ID } from './client';

// Define the School interface
export interface School {
  $id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'pending';
  enrollmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  logo?: string;
}

const schoolService = {
  // Get all schools
  getAllSchools: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID
      );
      return response.documents as School[];
    } catch (error) {
      console.error('Appwrite service :: getAllSchools :: error', error);
      throw error;
    }
  },

  // Get school by ID
  getSchoolById: async (schoolId: string) => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID,
        schoolId
      );
      return response as School;
    } catch (error) {
      console.error('Appwrite service :: getSchoolById :: error', error);
      throw error;
    }
  },

  // Create new school
  createSchool: async (schoolData: School) => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID,
        ID.unique(),
        {
          ...schoolData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          enrollmentCount: schoolData.enrollmentCount || 0,
          status: schoolData.status || 'pending'
        }
      );
      return response as School;
    } catch (error) {
      console.error('Appwrite service :: createSchool :: error', error);
      throw error;
    }
  },

  // Update school
  updateSchool: async (schoolId: string, schoolData: Partial<School>) => {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID,
        schoolId,
        {
          ...schoolData,
          updatedAt: new Date().toISOString()
        }
      );
      return response as School;
    } catch (error) {
      console.error('Appwrite service :: updateSchool :: error', error);
      throw error;
    }
  },

  // Delete school
  deleteSchool: async (schoolId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID,
        schoolId
      );
      return { success: true };
    } catch (error) {
      console.error('Appwrite service :: deleteSchool :: error', error);
      throw error;
    }
  },

  // Get schools by status
  getSchoolsByStatus: async (status: 'active' | 'inactive' | 'pending') => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID,
        [Query.equal('status', status)]
      );
      return response.documents as School[];
    } catch (error) {
      console.error('Appwrite service :: getSchoolsByStatus :: error', error);
      throw error;
    }
  },

  // Search schools by name
  searchSchools: async (searchTerm: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHOOLS_COLLECTION_ID,
        [Query.search('name', searchTerm)]
      );
      return response.documents as School[];
    } catch (error) {
      console.error('Appwrite service :: searchSchools :: error', error);
      throw error;
    }
  }
};

export default schoolService;
