/**
 * Autosave utility for managing drafts in browser localStorage.
 * Prevents content loss on tab switching, unmounting, page refreshes, or accidental navigation.
 */

export interface DraftEnvelope<T> {
  data: T;
  savedAt: number;
}

/**
 * Saves draft payload to localStorage with timestamp envelope
 */
export function saveDraft<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const envelope: DraftEnvelope<T> = {
      data,
      savedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (err) {
    console.warn(`[Autosave] Could not save draft to "${key}":`, err);
  }
}

/**
 * Loads draft payload from localStorage
 */
export function loadDraft<T>(key: string): DraftEnvelope<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'data' in parsed && typeof parsed.savedAt === 'number') {
      return parsed as DraftEnvelope<T>;
    }
    // Fallback for raw legacy objects
    return {
      data: parsed as T,
      savedAt: Date.now(),
    };
  } catch (err) {
    console.warn(`[Autosave] Could not parse draft from "${key}":`, err);
    return null;
  }
}

/**
 * Clears draft from localStorage
 */
export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Autosave] Could not clear draft for "${key}":`, err);
  }
}

/**
 * Checks whether draft exists
 */
export function hasDraft(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Formats draft timestamp into human-readable string
 */
export function formatDraftTime(timestamp: number, locale = 'uk'): string {
  try {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString(locale === 'uk' ? 'uk-UA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return timeStr;
  } catch {
    return '';
  }
}
