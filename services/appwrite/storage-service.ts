import { ID, Permission, Role } from 'appwrite';
import { storage, STORAGE_BUCKET_ID } from './client';

const storageService = {
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
};

export default storageService;