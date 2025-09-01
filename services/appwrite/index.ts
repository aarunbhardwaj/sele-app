// Export all services from a single file for easy imports
export { default as authService } from './auth-service';
export { classService } from './classService';
export { default as courseService } from './course-service';
export { default as progressService } from './progress-service';
export { default as quizService } from './quiz-service';
export { default as roleService } from './role-service';
export { default as schoolService } from './school-service';
export { default as storageService } from './storage-service';

// Export client and related from client.ts - use star export to get everything
export * from './client';
