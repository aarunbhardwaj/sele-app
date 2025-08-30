import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { withErrorHandling } from '../lib/errors';
import { showSuccess, showError } from '../lib/toast';

// Enhanced domain types with more detailed progress tracking
export interface LessonProgress {
  lessonId: string;
  courseId?: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  percent?: number; // 0-100
  timeSpent?: number; // seconds
  lastInteractionAt?: string;
  watchTime?: number; // for video lessons, in seconds
  attempts?: number;
  bookmarked?: boolean;
  notes?: string;
}

export interface VocabularyStat {
  term: string;
  definition: string;
  familiarity: number; // 0-1
  correct: number;
  incorrect: number;
  lastReviewedAt?: string;
  nextReviewDate?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  context?: string; // sentence or phrase where it was learned
  masteryLevel?: number; // 0-100
}

export interface ExerciseResult {
  id: string;
  type: string;
  attempts: number;
  successes: number;
  lastAttemptAt?: string;
  bestScore?: number;
  averageScore?: number;
  timeSpent?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'progress' | 'streak' | 'quiz' | 'course' | 'social';
}

export interface StudySession {
  date: string;
  duration: number; // minutes
  lessonsCompleted: number;
  exercisesCompleted: number;
  vocabularyReviewed: number;
  score?: number;
}

// Additional types
export interface VocabularyTermOption {
  term: string;
  definition: string;
  familiarity: number;
  masteryDate?: string;
}

export interface WeeklyStats {
  [day: string]: number;
}

interface LearningProgressState {
  lessons: Record<string, LessonProgress>;
  vocabulary: Record<string, VocabularyStat>;
  exercises: Record<string, ExerciseResult>;
  achievements: Achievement[];
  studySessions: StudySession[];
  
  // Derived metrics
  overallCompletion: number;
  streakDays: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // minutes
  averageSessionTime: number; // minutes
  weeklyProgress: number;
  monthlyProgress: number;
  
  // Vocabulary specific metrics
  vocabularyMastered: number;
  vocabularyReviewDue: number;
  
  // Lesson mutators
  markLessonStarted: (lessonId: string, courseId?: string) => void;
  updateLessonProgress: (lessonId: string, percent: number) => void;
  markLessonCompleted: (lessonId: string) => void;
  addLessonWatchTime: (lessonId: string, seconds: number) => void;
  bookmarkLesson: (lessonId: string) => void;
  addLessonNote: (lessonId: string, note: string) => void;
  
  // Vocabulary mutators
  recordVocabularyResult: (term: string, correct: boolean, definition?: string) => void;
  addVocabularyTerm: (term: string, definition: string, context?: string) => void;
  updateVocabularyMastery: (term: string, masteryLevel: number) => void;
  markVocabularyForReview: (term: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  
  // Exercise mutators
  recordExerciseAttempt: (id: string, type: string, success: boolean, score?: number, timeSpent?: number) => void;
  
  // Achievement system
  checkAndUnlockAchievements: () => Achievement[];
  
  // Study session tracking
  startStudySession: () => void;
  endStudySession: () => void;
  
  // Analytics and insights
  getWeeklyStats: () => { [key: string]: number };
  getVocabularyInsights: () => {
    needsReview: VocabularyStat[];
    recentlyMastered: VocabularyTermOption[];
    strugglingWith: VocabularyStat[];
  };
  getLearningInsights: () => {
    completionRate: number;
    averageScore: number;
    strongAreas: string[];
    improvementAreas: string[];
  };
  
  // Data management
  resetAll: () => void;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  
  hydrated: boolean;
}

const LearningProgressContext = createContext<LearningProgressState | undefined>(undefined);

export const LearningProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Record<string, LessonProgress>>({});
  const [vocabulary, setVocabulary] = useState<Record<string, VocabularyStat>>({});
  const [exercises, setExercises] = useState<Record<string, ExerciseResult>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);

  // Keys
  const STORAGE_KEY = 'learning_progress_v1';

  // Calculate streak based on daily interaction
  const calculateStreak = (lessons: Record<string, LessonProgress>) => {
    // Check if any interaction today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = new Date(today - 86400000).getTime(); // Subtract 1 day in ms
    
    let hasInteractionToday = false;
    let hasInteractionYesterday = false;
    let currentStreak = 0;
    
    Object.values(lessons).forEach(lesson => {
      if (!lesson.lastInteractionAt) return;
      
      const interactionDate = new Date(lesson.lastInteractionAt);
      const interactionDay = new Date(
        interactionDate.getFullYear(),
        interactionDate.getMonth(),
        interactionDate.getDate()
      ).getTime();
      
      if (interactionDay === today) {
        hasInteractionToday = true;
      } else if (interactionDay === yesterday) {
        hasInteractionYesterday = true;
      }
    });
    
    // Get last saved streak from storage
    if (hasInteractionToday) {
      // Already interacted today, maintain/increment streak
      currentStreak = streakDays > 0 ? streakDays : 1;
    } else if (hasInteractionYesterday && streakDays > 0) {
      // Interacted yesterday, maintain streak
      currentStreak = streakDays;
    } else {
      // Streak broken or never started
      currentStreak = 0;
    }
    
    return currentStreak;
  };

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const loadedLessons = parsed.lessons || {};
          const loadedVocabulary = parsed.vocabulary || {};
          const loadedExercises = parsed.exercises || {};
          const savedStreak = typeof parsed.streakDays === 'number' ? parsed.streakDays : 0;
          
          setLessons(loadedLessons);
          setVocabulary(loadedVocabulary);
          setExercises(loadedExercises);
          
          // Calculate streak based on last interactions
          const calculatedStreak = calculateStreak(loadedLessons);
          setStreakDays(calculatedStreak);
        }
      } catch (e) {
        console.warn('LearningProgress: failed to load persisted state', e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persist state (debounced via timeout)
  useEffect(() => {
    if (!hydrated) return; // avoid writing before initial load
    const timeout = setTimeout(() => {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lessons, vocabulary, exercises, streakDays })
      ).catch(err => console.warn('LearningProgress: persist failed', err));
    }, 400); // debounce
    return () => clearTimeout(timeout);
  }, [lessons, vocabulary, exercises, streakDays, hydrated]);

  const markLessonStarted = (lessonId: string, courseId?: string) => {
    setLessons(prev => ({
      ...prev,
      [lessonId]: prev[lessonId] ?? {
        lessonId,
        courseId,
        completed: false,
        startedAt: new Date().toISOString(),
        percent: 0,
        lastInteractionAt: new Date().toISOString(),
      }
    }));
  };

  const updateLessonProgress = (lessonId: string, percent: number) => {
    setLessons(prev => {
      const existing = prev[lessonId];
      if (!existing) return prev;
      return {
        ...prev,
        [lessonId]: {
          ...existing,
            percent: Math.min(100, Math.max(0, percent)),
            lastInteractionAt: new Date().toISOString(),
        }
      };
    });
  };

  const markLessonCompleted = (lessonId: string) => {
    setLessons(prev => {
      const existing = prev[lessonId];
      if (!existing) return prev;
      return {
        ...prev,
        [lessonId]: {
          ...existing,
          completed: true,
          percent: 100,
          completedAt: existing.completedAt ?? new Date().toISOString(),
          lastInteractionAt: new Date().toISOString(),
        }
      };
    });
  };

  const recordVocabularyResult = (term: string, correct: boolean, definition?: string) => {
    setVocabulary(prev => {
      const stat = prev[term] ?? { 
        term, 
        definition: definition || '', 
        familiarity: 0, 
        correct: 0, 
        incorrect: 0,
        masteryLevel: 0
      };
      const correctCount = stat.correct + (correct ? 1 : 0);
      const incorrectCount = stat.incorrect + (correct ? 0 : 1);
      const total = correctCount + incorrectCount;
      const familiarity = total ? correctCount / total : 0;
      const masteryLevel = Math.min(100, familiarity * 100);
      
      // Calculate next review date based on performance
      const nextReviewDate = new Date();
      if (correct && familiarity > 0.8) {
        nextReviewDate.setDate(nextReviewDate.getDate() + 7); // Review in a week
      } else if (correct) {
        nextReviewDate.setDate(nextReviewDate.getDate() + 3); // Review in 3 days
      } else {
        nextReviewDate.setDate(nextReviewDate.getDate() + 1); // Review tomorrow
      }
      
      return {
        ...prev,
        [term]: { 
          ...stat, 
          definition: definition || stat.definition,
          correct: correctCount, 
          incorrect: incorrectCount, 
          familiarity,
          masteryLevel,
          lastReviewedAt: new Date().toISOString(),
          nextReviewDate: nextReviewDate.toISOString()
        }
      };
    });
  };

  const recordExerciseAttempt = (id: string, type: string, success: boolean) => {
    setExercises(prev => {
      const ex = prev[id] ?? { id, type, attempts: 0, successes: 0 };
      const attempts = ex.attempts + 1;
      const successes = ex.successes + (success ? 1 : 0);
      return {
        ...prev,
        [id]: { ...ex, attempts, successes, lastAttemptAt: new Date().toISOString() }
      };
    });
  };

  const resetAll = () => {
    setLessons({});
    setVocabulary({});
    setExercises({});
    setStreakDays(0);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const overallCompletion = useMemo(() => {
    const values = Object.values(lessons);
    if (!values.length) return 0;
    return Math.round(values.reduce((acc, l) => acc + (l.percent ?? 0), 0) / values.length);
  }, [lessons]);

  const value: LearningProgressState = {
    lessons,
    vocabulary,
    exercises,
    overallCompletion,
    streakDays,
    markLessonStarted,
    updateLessonProgress,
    markLessonCompleted,
    recordVocabularyResult,
    recordExerciseAttempt,
    resetAll,
    hydrated,
  };

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
};

export const useLearningProgress = () => {
  const ctx = useContext(LearningProgressContext);
  if (!ctx) throw new Error('useLearningProgress must be used within LearningProgressProvider');
  return ctx;
};
