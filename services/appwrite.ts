// Main appwrite service that re-exports the modularized services
import {
  authService,
  courseService,
  progressService,
  quizService,
  roleService,
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

  // Storage Service Methods
  uploadMedia: storageService.uploadMedia,
  getFilePreview: storageService.getFilePreview,
  deleteFile: storageService.deleteFile,
};

export default appwriteService;