import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Basic domain types (can be expanded later)
export interface LessonProgress {
  lessonId: string;
  courseId?: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  percent?: number; // 0-100
  lastInteractionAt?: string;
}

export interface VocabularyStat {
  term: string;
  familiarity: number; // 0-1
  correct: number;
  incorrect: number;
  lastReviewedAt?: string;
}

export interface ExerciseResult {
  id: string;
  type: string;
  attempts: number;
  successes: number;
  lastAttemptAt?: string;
}

interface LearningProgressState {
  lessons: Record<string, LessonProgress>;
  vocabulary: Record<string, VocabularyStat>;
  exercises: Record<string, ExerciseResult>;
  // Derived metrics
  overallCompletion: number;
  streakDays: number;
  // Mutators
  markLessonStarted: (lessonId: string, courseId?: string) => void;
  updateLessonProgress: (lessonId: string, percent: number) => void;
  markLessonCompleted: (lessonId: string) => void;
  recordVocabularyResult: (term: string, correct: boolean) => void;
  recordExerciseAttempt: (id: string, type: string, success: boolean) => void;
  resetAll: () => void;
  hydrated: boolean;
}

const LearningProgressContext = createContext<LearningProgressState | undefined>(undefined);

export const LearningProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Record<string, LessonProgress>>({});
  const [vocabulary, setVocabulary] = useState<Record<string, VocabularyStat>>({});
  const [exercises, setExercises] = useState<Record<string, ExerciseResult>>({});
  const [streakDays, setStreakDays] = useState(0);
  const [hydrated, setHydrated] = useState(false);

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

  const recordVocabularyResult = (term: string, correct: boolean) => {
    setVocabulary(prev => {
      const stat = prev[term] ?? { term, familiarity: 0, correct: 0, incorrect: 0 };
      const correctCount = stat.correct + (correct ? 1 : 0);
      const incorrectCount = stat.incorrect + (correct ? 0 : 1);
      const total = correctCount + incorrectCount;
      const familiarity = total ? correctCount / total : 0;
      return {
        ...prev,
        [term]: { ...stat, correct: correctCount, incorrect: incorrectCount, familiarity, lastReviewedAt: new Date().toISOString() }
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
