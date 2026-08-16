import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface MasteredAlgorithm {
  algId: string;
  set: string;
  masteredAt: string;
  reviewCount: number;
}

export type LearningPath = 'beginner' | 'cfop' | 'roux' | 'zz';

export interface LearningProgressData {
  completedLessons: string[];
  masteredAlgorithms: MasteredAlgorithm[];
  masteredAlgsCount: number;
  currentPath: LearningPath;
  lastActiveLesson: string;
}

const API_BASE_URL = 'http://localhost:5000/api/learning';

export function useLearningProgress() {
  const { token, getAuthHeaders } = useAuth();
  const [progress, setProgress] = useState<LearningProgressData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/progress`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error || 'Failed to fetch learning progress');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching learning progress');
    } finally {
      setIsLoading(false);
    }
  }, [token, getAuthHeaders]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markLessonComplete = useCallback(async (lessonId: string, lastActive?: string) => {
    if (!token) return;
    try {
      setError(null);
      // Optimistic state update
      setProgress(prev => {
        if (!prev) return prev;
        const updatedLessons = Array.from(new Set([...prev.completedLessons, lessonId]));
        return {
          ...prev,
          completedLessons: updatedLessons,
          lastActiveLesson: lastActive || lessonId
        };
      });

      const res = await fetch(`${API_BASE_URL}/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ lessonId, lastActiveLesson: lastActive || lessonId })
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error || 'Failed to complete lesson');
      }
    } catch (err: any) {
      setError(err.message || 'Error marking lesson complete');
    }
  }, [token, getAuthHeaders]);

  const toggleAlgMastered = useCallback(async (algId: string, set: string, isMastered?: boolean) => {
    if (!token) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/master-algorithm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ algId, set, isMastered })
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error || 'Failed to update algorithm status');
      }
    } catch (err: any) {
      setError(err.message || 'Error toggling algorithm status');
    }
  }, [token, getAuthHeaders]);

  const setCurrentPath = useCallback(async (currentPath: LearningPath) => {
    if (!token) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ currentPath })
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error || 'Failed to update current path');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating current path');
    }
  }, [token, getAuthHeaders]);

  return {
    progress,
    isLoading,
    error,
    completedLessons: progress?.completedLessons || [],
    masteredAlgorithms: progress?.masteredAlgorithms || [],
    masteredAlgsCount: progress?.masteredAlgsCount || 0,
    currentPath: progress?.currentPath || 'cfop',
    lastActiveLesson: progress?.lastActiveLesson || '',
    markLessonComplete,
    toggleAlgMastered,
    setCurrentPath,
    refetchProgress: fetchProgress
  };
}
