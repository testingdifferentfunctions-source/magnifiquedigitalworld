import { useState, useEffect, useRef, useCallback } from 'react';
import { saveDraft, loadDraft, clearDraft, formatDraftTime } from '@/lib/autosave';

export interface UseLocalStorageDraftOptions<T> {
  key: string;
  defaultValue: T | (() => T);
}

export interface UseLocalStorageDraftReturn<T> {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
  setField: <K extends keyof T>(field: K, fieldValue: T[K]) => void;
  clearDraft: () => void;
  forceSave: () => void;
  savedAt: number | null;
  hasDraft: boolean;
  resetValue: (newVal?: T) => void;
  hydrateFromBackend: (backendData: T) => void;
  formatSavedTime: (locale?: string) => string;
}

/**
 * Universal React Hook for resilient, instant localStorage draft autosave & hydration.
 *
 * Guarantees:
 * 1. Lazy initialization from localStorage on mount (zero state delay / hydration loss).
 * 2. Synchronous write to localStorage on every value / field update.
 * 3. Browser lifecycle hooks (visibilitychange, beforeunload, pagehide, unmount) to force flush.
 * 4. Safe backend hydration fallback (only overwrites if no user draft exists).
 * 5. Explicit draft clearance after successful save/publish.
 */
export function useLocalStorageDraft<T>({
  key,
  defaultValue,
}: UseLocalStorageDraftOptions<T>): UseLocalStorageDraftReturn<T> {
  // Lazy initial state retrieval
  const [state, setState] = useState<{ val: T; savedAt: number | null; hasDraft: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = loadDraft<T>(key);
      if (saved && saved.data !== undefined) {
        return { val: saved.data, savedAt: saved.savedAt, hasDraft: true };
      }
    }
    const def = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
    return { val: def, savedAt: null, hasDraft: false };
  });

  const valueRef = useRef<T>(state.val);
  valueRef.current = state.val;

  const keyRef = useRef<string>(key);
  keyRef.current = key;

  // Update value and immediately synchronize to localStorage
  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextVal = typeof updater === 'function' ? (updater as (prev: T) => T)(prev.val) : updater;
        valueRef.current = nextVal;
        const now = Date.now();
        saveDraft(key, nextVal);
        return { val: nextVal, savedAt: now, hasDraft: true };
      });
    },
    [key]
  );

  // Update a single field in an object-based draft
  const setField = useCallback(
    <K extends keyof T>(field: K, fieldValue: T[K]) => {
      setState((prev) => {
        const currentObj = (prev.val && typeof prev.val === 'object') ? prev.val : ({} as T);
        const nextVal = { ...currentObj, [field]: fieldValue };
        valueRef.current = nextVal;
        const now = Date.now();
        saveDraft(key, nextVal);
        return { val: nextVal, savedAt: now, hasDraft: true };
      });
    },
    [key]
  );

  // Force synchronous save
  const forceSave = useCallback(() => {
    if (valueRef.current !== undefined) {
      saveDraft(key, valueRef.current);
      setState((prev) => ({ ...prev, savedAt: Date.now() }));
    }
  }, [key]);

  // Handle visibilitychange & window lifecycle
  useEffect(() => {
    const handleSave = () => {
      if (valueRef.current !== undefined) {
        saveDraft(key, valueRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleSave);
    window.addEventListener('pagehide', handleSave);

    return () => {
      handleSave();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleSave);
      window.removeEventListener('pagehide', handleSave);
    };
  }, [key]);

  // Clear draft from localStorage and reset indicator
  const clear = useCallback(() => {
    clearDraft(key);
    setState((prev) => ({ ...prev, savedAt: null, hasDraft: false }));
  }, [key]);

  // Reset value to default or provided custom data and purge draft
  const resetValue = useCallback(
    (newVal?: T) => {
      clearDraft(key);
      const target =
        newVal !== undefined
          ? newVal
          : typeof defaultValue === 'function'
          ? (defaultValue as () => T)()
          : defaultValue;
      valueRef.current = target;
      setState({ val: target, savedAt: null, hasDraft: false });
    },
    [key, defaultValue]
  );

  // Hydrate from existing database record ONLY if user does not already have an unsaved local draft
  const hydrateFromBackend = useCallback(
    (backendData: T) => {
      if (typeof window === 'undefined') return;
      const existingDraft = loadDraft<T>(key);
      if (existingDraft && existingDraft.data !== undefined) {
        // User already has an unsaved draft for this item, keep it!
        return;
      }
      // No local draft exists, hydrate with backend data
      valueRef.current = backendData;
      setState({ val: backendData, savedAt: null, hasDraft: false });
    },
    [key]
  );

  const formatSavedTime = useCallback(
    (locale = 'uk') => {
      if (!state.savedAt) return '';
      return formatDraftTime(state.savedAt, locale);
    },
    [state.savedAt]
  );

  return {
    value: state.val,
    setValue,
    setField,
    clearDraft: clear,
    forceSave,
    savedAt: state.savedAt,
    hasDraft: state.hasDraft,
    resetValue,
    hydrateFromBackend,
    formatSavedTime,
  };
}
export default useLocalStorageDraft;
