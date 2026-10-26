import type { AnalysisResult, TerminalSettings, TerminalDiscoveryStats } from '../types/index.ts';

const ARCHIVE_KEY = 'the_last_commit_archive_v1';
const CRT_SETTING_KEY = 'the_last_commit_crt_mode';
const SETTINGS_KEY = 'the_last_commit_terminal_settings_v1';
const STATS_KEY = 'the_last_commit_terminal_stats_v1';

export const DEFAULT_TERMINAL_SETTINGS: TerminalSettings = {
  speed: 1.0,
  density: 1.0,
  brightness: 1.0,
  colorTheme: 'matrix_green',
  fpsCap: 'auto',
  crtScanlines: true,
  reducedEffects: false,
  soundEnabled: false,
  soundVolume: 0.25,
};

export function getTerminalSettings(): TerminalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_TERMINAL_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TERMINAL_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_TERMINAL_SETTINGS };
  }
}

export function saveTerminalSettings(settings: TerminalSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Also sync the crtScanlines preference with CRT_SETTING_KEY
    localStorage.setItem(CRT_SETTING_KEY, String(settings.crtScanlines));
  } catch (err) {
    console.error('Failed to save terminal settings:', err);
  }
}

export function getDiscoveryStats(): TerminalDiscoveryStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        signalsIntercepted: 0,
        fragmentsFound: [],
        ripplesTriggered: 0,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      signalsIntercepted: Number(parsed.signalsIntercepted) || 0,
      fragmentsFound: Array.isArray(parsed.fragmentsFound) ? parsed.fragmentsFound : [],
      ripplesTriggered: Number(parsed.ripplesTriggered) || 0,
    };
  } catch {
    return {
      signalsIntercepted: 0,
      fragmentsFound: [],
      ripplesTriggered: 0,
    };
  }
}

export function recordDiscoveryStat<K extends keyof TerminalDiscoveryStats>(
  key: K,
  value: TerminalDiscoveryStats[K] | ((prev: TerminalDiscoveryStats[K]) => TerminalDiscoveryStats[K])
): TerminalDiscoveryStats {
  try {
    const current = getDiscoveryStats();
    if (typeof value === 'function') {
      current[key] = (value as any)(current[key]);
    } else {
      current[key] = value;
    }
    localStorage.setItem(STATS_KEY, JSON.stringify(current));
    return current;
  } catch {
    return getDiscoveryStats();
  }
}

export function getSavedArchive(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Validate record schema to protect against corrupted state
    return parsed.filter(item => (
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.originalCode === 'string' &&
      typeof item.summary === 'string'
    ));
  } catch (err) {
    console.error('Failed to load archive from localStorage:', err);
    return [];
  }
}

export function saveResultToArchive(result: AnalysisResult): boolean {
  try {
    const current = getSavedArchive();
    // Check if duplicate ID exists, replace if so; otherwise prepend
    const existingIndex = current.findIndex(item => item.id === result.id);
    let updated: AnalysisResult[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = result;
    } else {
      updated = [result, ...current].slice(0, 50); // Keep last 50 analyses
    }
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save record to localStorage:', err);
    return false;
  }
}

export function removeResultFromArchive(id: string): AnalysisResult[] {
  try {
    const current = getSavedArchive();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove record from archive:', err);
    return [];
  }
}

export function clearEntireArchive(): boolean {
  try {
    localStorage.removeItem(ARCHIVE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear archive:', err);
    return false;
  }
}

export function getCrtPreference(): boolean {
  try {
    const stored = localStorage.getItem(CRT_SETTING_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to true unless user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  } catch {
    return true;
  }
}

export function setCrtPreference(enabled: boolean): void {
  try {
    localStorage.setItem(CRT_SETTING_KEY, String(enabled));
  } catch (err) {
    console.error('Failed to store CRT preference:', err);
  }
}
