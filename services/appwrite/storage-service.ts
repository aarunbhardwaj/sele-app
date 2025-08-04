import { ID } from 'appwrite';
import * as FileSystem from 'expo-file-system';
import { storage, STORAGE_BUCKET_ID, account } from './client';
import { Platform } from 'react-native';
import client from './client';

const storageService = {
  // Media storage methods
  uploadMedia: async (fileData) => {
    try {
      console.log('File object received for upload:', {
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        hasUri: !!fileData.uri
      });
      
      if (!fileData.uri) {
        throw new Error('File URI is required for upload');
      }
      
      // Generate a unique file ID
      const fileId = ID.unique();
      
      // For React Native, we'll use a direct fetch approach which has better compatibility
      // with Appwrite's server-side expectations
      
      // First, check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(fileData.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist at the specified URI');
      }
      
      // Get current session for authentication
      let session;
      try {
        session = await account.getSession('current');
        console.log('Got current session:', session ? 'success' : 'failed');
      } catch (sessionError) {
        console.error('Failed to get session:', sessionError);
        // Continue without session, will use cookies if available
      }
      
      // Prepare the fetch options including the file data
      const formData = new FormData();
      
      // Create the file part correctly for React Native
      // The key part is making sure the name and type are correctly set
      const filePart = {
        uri: fileData.uri,
        name: fileData.name || `file_${Date.now()}.mp4`,
        type: fileData.type || 'video/mp4'
      };
      
      // Append the file to form data with the 'file' key that Appwrite expects
      formData.append('file', filePart);
      
      // Get the project ID and endpoint from the Appwrite client
      const { endpoint, project } = client.config;
      
      // Prepare headers with authentication
      const headers = {
        'X-Appwrite-Project': project,
      };
      
      // Add session token if available
      if (session) {
        headers['X-Appwrite-Session'] = session.$id;
      }
      
      // Add the session cookie if we're in a browser environment
      if (client.headers['X-Fallback-Cookies']) {
        headers['X-Fallback-Cookies'] = client.headers['X-Fallback-Cookies'];
      }
      
      // Get the correct bucket ID - using the actual env value, not the constant
      const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || STORAGE_BUCKET_ID;
      console.log('Using storage bucket ID:', bucketId);
      
      // Construct the Appwrite API URL for file uploads with the correct bucket ID
      const url = `${endpoint}/storage/buckets/${bucketId}/files`;
      
      // Add fileId to form data instead of URL query parameter
      formData.append('fileId', fileId);
      
      console.log('Uploading file via fetch with URL:', url);
      console.log('Headers:', JSON.stringify(headers));
      
      // Make the fetch request
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
        credentials: 'include' // Include credentials for cookies
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload response error:', errorData);
        throw new Error(`Upload failed with status ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      console.log('File uploaded successfully:', result.$id);
      
      return result;
    } catch (error) {
      console.error('Appwrite service :: uploadMedia :: error', error);
      throw error;
    }
  },
  
  getFilePreview: (fileId) => {
    try {
      // Get the correct bucket ID - using the environment variable
      const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || STORAGE_BUCKET_ID;
      
      // Use getFileView instead of getFilePreview for a direct URL
      const previewUrl = storage.getFileView(bucketId, fileId);
      console.log('File preview URL:', previewUrl.toString());
      return previewUrl;
    } catch (error) {
      console.error('Appwrite service :: getFilePreview :: error', error);
      return null;
    }
  },
  
  deleteFile: async (fileId) => {
    try {
      // Get the correct bucket ID - using the environment variable
      const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || STORAGE_BUCKET_ID;
      
      await storage.deleteFile(bucketId, fileId);
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteFile :: error', error);
      throw error;
    }
  },
};

export default storageService;