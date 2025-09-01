import { ID, Query } from 'appwrite';
import { getAppwriteClient } from './client';

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
  // Get all schools with pagination and filtering
  getAllSchools: async (limit?: number, offset?: number, queries?: string[]) => {
    try {
      const { databases, config } = getAppwriteClient();
      const queryFilters = [];
      
      // Add custom queries if provided
      if (queries && queries.length > 0) {
        // Convert string queries to proper Query objects
        queries.forEach(queryStr => {
          if (queryStr.includes('LIKE')) {
            // Handle search queries like 'name LIKE "%searchterm%"'
            const match = queryStr.match(/(\w+)\s+LIKE\s+"?%(.+)%"?/);
            if (match) {
              const [, field, term] = match;
              queryFilters.push(Query.search(field, term));
            }
          } else if (queryStr.includes('=')) {
            // Handle exact match queries like 'status = "active"'
            const match = queryStr.match(/(\w+)\s*=\s*"?([^"]+)"?/);
            if (match) {
              const [, field, value] = match;
              queryFilters.push(Query.equal(field, value));
            }
          }
        });
      }
      
      // Add pagination
      if (limit) {
        queryFilters.push(Query.limit(limit));
      }
      if (offset) {
        queryFilters.push(Query.offset(offset));
      }
      
      // Add ordering
      queryFilters.push(Query.orderDesc('$createdAt'));
      
      const response = await databases.listDocuments(
        config.databaseId,
        config.schoolsCollectionId,
        queryFilters
      );
      
      return response; // Return the full response with total count
    } catch (error) {
      console.error('Appwrite service :: getAllSchools :: error', error);
      throw error;
    }
  },

  // Get school by ID
  getSchoolById: async (schoolId: string) => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.getDocument(
        config.databaseId,
        config.schoolsCollectionId,
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
      const { databases, config } = getAppwriteClient();
      const response = await databases.createDocument(
        config.databaseId,
        config.schoolsCollectionId,
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
      const { databases, config } = getAppwriteClient();
      const response = await databases.updateDocument(
        config.databaseId,
        config.schoolsCollectionId,
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
      const { databases, config } = getAppwriteClient();
      await databases.deleteDocument(
        config.databaseId,
        config.schoolsCollectionId,
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
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.schoolsCollectionId,
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
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.schoolsCollectionId,
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
