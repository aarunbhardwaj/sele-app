// Base interfaces
export interface BaseDocument {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
}

// User related interfaces
export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  prefs?: Record<string, any>;
}

export interface UserProfile extends BaseDocument {
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  bio?: string;
  languagePreference?: string;
  learningGoals?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  isAdmin?: boolean;
  schoolId?: string;
  role?: string;
  preferences?: UserPreferences;
  // Added fields used by admin users screen and auth service helpers
  displayName?: string; // shown name
  phone?: string; // contact phone
  status?: 'active' | 'inactive' | 'suspended'; // account status for moderation
  lastActive?: string; // timestamp of last activity
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showProgress: boolean;
  };
  learning: {
    dailyGoal: number; // minutes per day
    reminderTime?: string; // HH:MM format
    difficultyPreference: 'adaptive' | 'easy' | 'medium' | 'hard';
  };
}

// Role and Permission interfaces
export interface Role extends BaseDocument {
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

// School related interfaces
export interface School extends BaseDocument {
  name: string;
  description?: string;
  address?: string;
  website?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  adminIds: string[];
  settings?: SchoolSettings;
}

export interface SchoolSettings {
  allowSelfRegistration: boolean;
  requireApproval: boolean;
  defaultUserRole: string;
  features: {
    courses: boolean;
    quizzes: boolean;
    classes: boolean;
    analytics: boolean;
  };
}

// Course related interfaces
export interface Course extends BaseDocument {
  title: string;
  description: string;
  thumbnail?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  duration: number; // in minutes
  language: string;
  instructorId: string;
  instructorName?: string;
  price?: number;
  currency?: string;
  isPublished: boolean;
  isFree: boolean;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  prerequisites?: string[];
  learningOutcomes?: string[];
  schoolId?: string;
  metadata?: CourseMetadata;
}

export interface CourseMetadata {
  difficulty: number; // 1-10 scale
  estimatedHours: number;
  certificateOffered: boolean;
  lastUpdated: string;
  version: string;
}

export interface Lesson extends BaseDocument {
  courseId: string;
  title: string;
  description?: string;
  content: string;
  videoUrl?: string;
  audioUrl?: string;
  duration: number; // in seconds
  order: number;
  isPreview: boolean;
  resources?: LessonResource[];
  exercises?: Exercise[];
  objectives?: string[];
  transcript?: string;
}

export interface LessonResource {
  id: string;
  type: 'pdf' | 'image' | 'audio' | 'video' | 'link' | 'document';
  title: string;
  url: string;
  size?: number;
  description?: string;
}

// Exercise and Quiz interfaces
export interface Exercise extends BaseDocument {
  lessonId?: string;
  courseId?: string;
  type: 'multiple-choice' | 'fill-blank' | 'drag-drop' | 'audio-match' | 'speaking' | 'writing';
  title: string;
  instructions: string;
  content: ExerciseContent;
  points: number;
  timeLimit?: number; // in seconds
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export interface ExerciseContent {
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  hints?: string[];
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    alt?: string;
  };
}

export interface Quiz extends BaseDocument {
  title: string;
  description?: string;
  courseId?: string;
  instructions?: string;
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  maxAttempts?: number;
  isPublished: boolean;
  showResults: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questions: QuizQuestion[];
  tags?: string[];
}

export interface QuizQuestion extends BaseDocument {
  quizId: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
  explanation?: string;
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    alt?: string;
  };
}

export interface QuizAttempt extends BaseDocument {
  quizId: string;
  userId: string;
  userAnswers: Record<string, any>;
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  status: 'in-progress' | 'completed' | 'abandoned' | 'timed-out';
}

// Progress tracking interfaces  
export interface UserProgress extends BaseDocument {
  userId: string;
  courseId: string;
  lessonProgress: Record<string, LessonProgress>;
  overallCompletion: number; // percentage
  timeSpent: number; // in minutes
  lastAccessedAt: string;
  streakDays: number;
  currentStreak: number;
  longestStreak: number;
  certificates?: string[];
}

export interface LessonProgress {
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // percentage
  timeSpent: number; // in seconds
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt: string;
  watchTime?: number; // for video lessons
  attempts?: number;
}

export interface LessonCompletion extends BaseDocument {
  userId: string;
  lessonId: string;
  courseId: string;
  completedAt: string;
  timeSpent: number;
  score?: number;
  certificateIssued?: boolean;
}

export interface UserActivity extends BaseDocument {
  userId: string;
  type: 'login' | 'course-started' | 'lesson-completed' | 'quiz-attempted' | 'achievement-earned';
  entityId?: string; // courseId, lessonId, quizId, etc.
  entityType?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Class and Scheduling interfaces
export interface Class extends BaseDocument {
  // Basic class information
  title: string;
  description?: string;
  code: string; // Unique class code like "MATH-101-A"
  
  // Core relationships for signup workflow
  schoolId: string; // Which school this class belongs to
  courseId: string; // Auto-assigned course for this class
  instructorId?: string; // Admin assigns instructor later
  instructorName?: string; // Cached instructor name
  
  // Class categorization
  subject: string; // Math, Science, English, etc.
  grade: string; // Grade 1, Grade 2, etc.
  section?: string; // A, B, C sections
  level?: string; // beginner, intermediate, advanced
  academicYear: string; // 2024-2025
  semester?: string; // Fall, Spring, Summer
  
  // Enrollment management
  maxStudents?: number; // Maximum capacity
  currentEnrollment?: number; // Current number of enrolled students
  enrolledStudents?: string[]; // Array of student IDs
  waitingList?: string[]; // Array of student IDs on waiting list
  allowWaitlist?: boolean; // Whether to allow waitlist when full
  
  // Scheduling information
  schedule?: string; // JSON schedule object
  meetingDays?: string; // "Monday,Wednesday,Friday"
  startTime?: string; // "09:00"
  endTime?: string; // "10:30"
  duration?: number; // Class duration in minutes
  timezone?: string; // America/New_York
  room?: string; // Physical or virtual room
  
  // Class status and settings
  status: 'active' | 'inactive' | 'full' | 'archived';
  enrollmentStatus: 'open' | 'closed' | 'waitlist-only';
  type?: 'in-person' | 'online' | 'hybrid';
  isPublic?: boolean; // Whether visible in public class listing
  requiresApproval?: boolean; // Whether enrollment needs approval
  isActive: boolean; // Whether class is currently active
  
  // Virtual class settings
  meetingUrl?: string; // Zoom/Teams meeting URL
  meetingId?: string; // Meeting ID
  meetingPassword?: string; // Meeting password
  
  // Dates
  startDate?: string; // Class start date
  endDate?: string; // Class end date
  createdAt: string;
  updatedAt: string;
}

// Analytics and Reporting interfaces
export interface LearningAnalytics {
  userId: string;
  courseId?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  metrics: {
    timeSpent: number;
    lessonsCompleted: number;
    quizzesAttempted: number;
    averageScore: number;
    streakDays: number;
    achievementsEarned: number;
  };
  trends: {
    engagementScore: number;
    progressRate: number;
    retentionRate: number;
  };
}

// Vocabulary and Language Learning specific
export interface VocabularyItem extends BaseDocument {
  word: string;
  definition: string;
  pronunciation?: string;
  audioUrl?: string;
  partOfSpeech: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  examples: string[];
  translations?: Record<string, string>;
  tags: string[];
  courseId?: string;
  lessonId?: string;
}

export interface VocabularyStat {
  word: string;
  correct: number;
  incorrect: number;
  lastReviewed: string;
  masteryLevel: number; // 0-100
  nextReviewDate: string;
}

// Notification interfaces
export interface Notification extends BaseDocument {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  category: 'course' | 'quiz' | 'class' | 'achievement' | 'system';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  expiresAt?: string;
}

// Achievement and Gamification
export interface Achievement extends BaseDocument {
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'quiz' | 'course' | 'social';
  criteria: AchievementCriteria;
  points: number;
  badge?: string;
  isActive: boolean;
}

export interface AchievementCriteria {
  type: 'count' | 'percentage' | 'streak' | 'score' | 'time';
  target: number;
  entity?: string; // what to count/measure
  condition?: string; // additional conditions
}

export interface UserAchievement extends BaseDocument {
  userId: string;
  achievementId: string;
  earnedAt: string;
  progress: number;
  isCompleted: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form and validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}

// Export all types for easy importing
export * from './types';

// Type guards
export function isUser(obj: any): obj is User {
  return obj && typeof obj.$id === 'string' && typeof obj.email === 'string';
}

export function isCourse(obj: any): obj is Course {
  return obj && typeof obj.$id === 'string' && typeof obj.title === 'string';
}

export function isLesson(obj: any): obj is Lesson {
  return obj && typeof obj.$id === 'string' && typeof obj.courseId === 'string';
}