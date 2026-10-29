import { useState, useRef, useCallback } from 'react';
import { Annotation } from '../types';

export interface HistorySnapshot {
  content: string;
  annotations: Annotation[];
}

export function useHistory(initialContent: string, initialAnnotations: Annotation[]) {
  const [history, setHistory] = useState<HistorySnapshot[]>([
    { content: initialContent, annotations: initialAnnotations },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const debounceTimer = useRef<number | null>(null);
  const isNavigatingHistory = useRef(false);

  // Push new snapshot to history
  const pushSnapshot = useCallback(
    (content: string, annotations: Annotation[], immediate = false) => {
      if (isNavigatingHistory.current) {
        isNavigatingHistory.current = false;
        return;
      }

      const commit = () => {
        setHistory((prev) => {
          const current = prev[currentIndex];
          // Skip if identical to current snapshot
          if (
            current &&
            current.content === content &&
            current.annotations.length === annotations.length &&
            JSON.stringify(current.annotations) === JSON.stringify(annotations)
          ) {
            return prev;
          }

          // Truncate future branch
          const next = prev.slice(0, currentIndex + 1);
          // Limit to max 60 snapshots
          if (next.length >= 60) {
            next.shift();
          }
          return [...next, { content, annotations }];
        });
        setCurrentIndex((prev) => Math.min(prev + 1, 59));
      };

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (immediate) {
        commit();
      } else {
        debounceTimer.current = window.setTimeout(commit, 400);
      }
    },
    [currentIndex]
  );

  // Undo (返回)
  const undo = useCallback((): HistorySnapshot | null => {
    if (currentIndex > 0) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const targetIndex = currentIndex - 1;
      isNavigatingHistory.current = true;
      setCurrentIndex(targetIndex);
      return history[targetIndex];
    }
    return null;
  }, [currentIndex, history]);

  // Redo (前进)
  const redo = useCallback((): HistorySnapshot | null => {
    if (currentIndex < history.length - 1) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const targetIndex = currentIndex + 1;
      isNavigatingHistory.current = true;
      setCurrentIndex(targetIndex);
      return history[targetIndex];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
