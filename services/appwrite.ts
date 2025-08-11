// Main appwrite service that re-exports the modularized services
import {
  authService,
  courseService,
  progressService,
  quizService,
  roleService,
  schoolService,
  storageService
} from './appwrite/index';

// Create a consolidated service object that maintains the same API
// as the original appwriteService to avoid breaking existing code
const appwriteService = {
  // Auth Service Methods
  createAccount: authService.createAccount,
  login: authService.login,
  getCurrentUser: authService.getCurrentUser,
  getUserAccount: authService.getUserAccount,
  isLoggedIn: authService.isLoggedIn,
  logout: authService.logout,
  resetPassword: authService.resetPassword,
  completePasswordRecovery: authService.completePasswordRecovery,
  createUserProfile: authService.createUserProfile,
  getUserProfile: authService.getUserProfile,
  updateUserProfile: authService.updateUserProfile,
  getAllUsers: authService.getAllUsers,
  getUserById: authService.getUserById || (async (userId) => {
    try {
      // Get user from the users collection using the provided ID
      const user = await authService.getUserProfile(userId);
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }),
  updateUser: authService.updateUser || (async (userId, userData) => {
    try {
      // Update user in the users collection
      const updatedUser = await authService.updateUserProfile(userId, userData);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }),
  updateUserStatus: authService.updateUserStatus || (async (userId, status) => {
    try {
      // Update user status in the users collection
      const updatedUser = await authService.updateUserProfile(userId, { status });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }),

  // Course Service Methods
  getAllCourses: courseService.getAllCourses,
  createCourse: courseService.createCourse,
  updateCourse: courseService.updateCourse,
  deleteCourse: courseService.deleteCourse,
  getCoursesByLevel: courseService.getCoursesByLevel,
  getCourseById: courseService.getCourseById,
  getLessonsByCourse: courseService.getLessonsByCourse,
  createLesson: courseService.createLesson,
  updateLesson: courseService.updateLesson,
  deleteLesson: courseService.deleteLesson,
  getLessonById: courseService.getLessonById,
  getExercisesByLesson: courseService.getExercisesByLesson,
  assignInstructorToCourse: courseService.assignInstructorToCourse,
  removeInstructorFromCourse: courseService.removeInstructorFromCourse,
  getInstructors: courseService.getInstructors,
  getInstructorsByCourse: courseService.getInstructorsByCourse,
  addInstructorToCourse: courseService.addInstructorToCourse,
  getEligibleInstructors: courseService.getEligibleInstructors,

  // Progress Service Methods
  getUserProgress: progressService.getUserProgress,
  getUserCourseProgress: progressService.getUserCourseProgress,
  createUserProgress: progressService.createUserProgress,
  updateUserProgress: progressService.updateUserProgress,
  recordLessonCompletion: progressService.recordLessonCompletion,
  trackUserActivity: progressService.trackUserActivity,

  // Quiz Service Methods
  getAllQuizzes: quizService.getAllQuizzes,
  getQuizById: quizService.getQuizById,
  createQuiz: quizService.createQuiz,
  updateQuiz: quizService.updateQuiz,
  deleteQuiz: quizService.deleteQuiz,
  getQuestionsByQuiz: quizService.getQuestionsByQuiz,
  createQuestion: quizService.createQuestion,
  updateQuestion: quizService.updateQuestion,
  deleteQuestion: quizService.deleteQuestion,
  recordQuizAttempt: quizService.recordQuizAttempt,
  getUserQuizAttempts: quizService.getUserQuizAttempts,

  // Role Management Methods
  createRole: roleService.createRole,
  getAllRoles: roleService.getAllRoles,
  updateRole: roleService.updateRole,
  deleteRole: roleService.deleteRole,
  assignRoleToUser: roleService.assignRoleToUser,
  removeRoleFromUser: roleService.removeRoleFromUser,
  getUserRoles: roleService.getUserRoles,
  
  // Helper method to check if a user is an admin
  isUserAdmin: async (userId: string): Promise<boolean> => {
    try {
      // Get all roles assigned to the user
      const roles = await roleService.getUserRoles(userId);
      
      // Check if any of the roles has admin privileges
      // This depends on how your app defines admin roles
      // Common patterns include: checking for a specific role name 
      // or checking for specific permissions in the role
      return roles.some(role => 
        role.name?.toLowerCase() === 'admin' || 
        role.name?.toLowerCase() === 'administrator'
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false; // Default to false on error
    }
  },

  // Storage Service Methods
  uploadMedia: storageService.uploadMedia,
  getFilePreview: storageService.getFilePreview,
  deleteFile: storageService.deleteFile,

  // School Management Methods
  getAllSchools: schoolService.getAllSchools,
  getSchoolById: schoolService.getSchoolById,
  createSchool: schoolService.createSchool,
  updateSchool: schoolService.updateSchool,
  deleteSchool: schoolService.deleteSchool,
  getSchoolsByStatus: schoolService.getSchoolsByStatus,
  searchSchools: schoolService.searchSchools,
};

export default appwriteService;