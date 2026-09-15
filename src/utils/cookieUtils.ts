/**
 * Cookie Management Utilities for StarStadium NFL Pro
 * Handles persistent storage of user preferences (like scoring alerts) in browser cookies using js-cookie.
 */
import Cookies from 'js-cookie';

export interface AlertsFilterConfig {
  touchdowns: boolean;
  fieldGoals: boolean;
  defensive: boolean;
  safeties: boolean;
  redzone: boolean;
}

export interface StoredAlertsConfig {
  alertsEnabled: boolean; // MUST ALWAYS START OFF (false) unless explicitly saved in cookie!
  soundEnabled: boolean;  // MUST ALWAYS START OFF (false) unless explicitly saved in cookie!
  autoSimulation: boolean; // MUST ALWAYS START OFF (false) unless explicitly saved in cookie!
  filters: AlertsFilterConfig;
  savedAt: string;
  source: 'cookie' | 'default_off';
}

export const COOKIE_NAMES = {
  ALERTS_ENABLED: 'starstadium_alerts_enabled',
  ALERTS_SOUND: 'starstadium_alerts_sound',
  ALERTS_SIMULATION: 'starstadium_alerts_simulation',
  ALERTS_CONFIG: 'starstadium_alerts_config'
} as const;

export const DEFAULT_ALERTS_FILTER: AlertsFilterConfig = {
  touchdowns: true,
  fieldGoals: true,
  defensive: true,
  safeties: true,
  redzone: true
};

/**
 * Standard default configuration:
 * ALERTS ALWAYS START OFF BY DEFAULT!
 */
export const DEFAULT_ALERTS_CONFIG: StoredAlertsConfig = {
  alertsEnabled: false,
  soundEnabled: false,
  autoSimulation: false,
  filters: DEFAULT_ALERTS_FILTER,
  savedAt: '',
  source: 'default_off'
};

/**
 * Read a cookie by name safely using js-cookie with native document.cookie fallback.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const val = Cookies.get(name);
    if (val !== undefined && val !== null && val !== '') return val;
    // Fallback: parse document.cookie directly
    if (typeof document.cookie === 'string' && document.cookie.length > 0) {
      const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    return null;
  } catch (err) {
    console.warn(`[CookieUtils] Error reading cookie "${name}":`, err);
    try {
      if (typeof document.cookie === 'string' && document.cookie.length > 0) {
        const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
        if (match) {
          return decodeURIComponent(match[1]);
        }
      }
    } catch {
      // ignore fallback error
    }
    return null;
  }
}

/**
 * Set a cookie with standard 365-day expiration and Lax SameSite policy using js-cookie.
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  try {
    Cookies.set(name, value, {
      expires: days,
      sameSite: 'lax',
      path: '/'
    });
  } catch (err) {
    console.warn(`[CookieUtils] Error setting cookie "${name}" with js-cookie:`, err);
  }
}

/**
 * Delete a cookie by name using js-cookie.
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    Cookies.remove(name, { path: '/' });
  } catch (err) {
    console.warn(`[CookieUtils] Error deleting cookie "${name}" with js-cookie:`, err);
  }
}

/**
 * Load alert preferences from browser cookies.
 * CRITICAL RULE: If no cookie exists, alerts ALWAYS start OFF (false).
 * If any cookie exists, the user's previously stored preference is respected.
 */
export function getStoredAlertsConfig(): StoredAlertsConfig {
  if (typeof document === 'undefined') {
    return { ...DEFAULT_ALERTS_CONFIG };
  }

  try {
    // Check primary individual cookies and common fallback names
    let enabledCookie = getCookie(COOKIE_NAMES.ALERTS_ENABLED);
    if (enabledCookie === null) {
      enabledCookie = getCookie('alerts_enabled') || getCookie('scoring_alerts_enabled') || getCookie('nfl_alerts_enabled');
    }

    let soundCookie = getCookie(COOKIE_NAMES.ALERTS_SOUND);
    if (soundCookie === null) {
      soundCookie = getCookie('alerts_sound') || getCookie('scoring_alerts_sound');
    }

    let simulationCookie = getCookie(COOKIE_NAMES.ALERTS_SIMULATION);
    if (simulationCookie === null) {
      simulationCookie = getCookie('alerts_simulation') || getCookie('scoring_alerts_simulation');
    }

    // Try reading detailed config cookie for sub-preferences
    let rawConfig = getCookie(COOKIE_NAMES.ALERTS_CONFIG);
    if (!rawConfig) {
      rawConfig = getCookie('alerts_config') || getCookie('scoring_alerts_config');
    }

    let parsedConfig: Partial<StoredAlertsConfig> = {};
    if (rawConfig) {
      try {
        parsedConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
      } catch {
        parsedConfig = {};
      }
    }

    // Check if any cookie exists
    const hasAnyCookie = enabledCookie !== null || rawConfig !== null || soundCookie !== null || simulationCookie !== null;

    // If no cookie was ever set by user, ALWAYS return default OFF!
    if (!hasAnyCookie) {
      return {
        ...DEFAULT_ALERTS_CONFIG,
        source: 'default_off'
      };
    }

    // Resolve alertsEnabled preference from cookie
    let alertsEnabled = false;
    if (enabledCookie !== null) {
      alertsEnabled = enabledCookie === 'true' || enabledCookie === '1' || enabledCookie === 'enabled';
    } else if (parsedConfig.alertsEnabled !== undefined) {
      alertsEnabled = Boolean(parsedConfig.alertsEnabled);
    }

    // Resolve soundEnabled preference from cookie
    let soundEnabled = false;
    if (soundCookie !== null) {
      soundEnabled = soundCookie === 'true' || soundCookie === '1' || soundCookie === 'enabled';
    } else if (parsedConfig.soundEnabled !== undefined) {
      soundEnabled = Boolean(parsedConfig.soundEnabled);
    }

    // Resolve autoSimulation preference from cookie
    let autoSimulation = false;
    if (simulationCookie !== null) {
      autoSimulation = simulationCookie === 'true' || simulationCookie === '1' || simulationCookie === 'enabled';
    } else if (parsedConfig.autoSimulation !== undefined) {
      autoSimulation = Boolean(parsedConfig.autoSimulation);
    }

    const filters: AlertsFilterConfig = {
      ...DEFAULT_ALERTS_FILTER,
      ...(parsedConfig.filters || {})
    };

    return {
      alertsEnabled,
      soundEnabled,
      autoSimulation,
      filters,
      savedAt: parsedConfig.savedAt || new Date().toISOString(),
      source: 'cookie'
    };
  } catch (err) {
    console.warn('[CookieUtils] Error parsing alert config from cookies, defaulting to OFF:', err);
    return { ...DEFAULT_ALERTS_CONFIG };
  }
}

/**
 * Persist alert preferences to browser cookies.
 * Called whenever the user toggles alerts, sound, auto-simulation, or categories.
 */
export function saveAlertsConfigToCookies(config: Partial<StoredAlertsConfig>): StoredAlertsConfig {
  if (typeof document === 'undefined') {
    return { ...DEFAULT_ALERTS_CONFIG, ...config };
  }

  try {
    const current = getStoredAlertsConfig();
    const updated: StoredAlertsConfig = {
      alertsEnabled: config.alertsEnabled !== undefined ? config.alertsEnabled : current.alertsEnabled,
      soundEnabled: config.soundEnabled !== undefined ? config.soundEnabled : current.soundEnabled,
      autoSimulation: config.autoSimulation !== undefined ? config.autoSimulation : current.autoSimulation,
      filters: config.filters || current.filters || DEFAULT_ALERTS_FILTER,
      savedAt: new Date().toISOString(),
      source: 'cookie'
    };

    // Store primary toggle cookie
    setCookie(COOKIE_NAMES.ALERTS_ENABLED, String(updated.alertsEnabled), 365);
    setCookie(COOKIE_NAMES.ALERTS_SOUND, String(updated.soundEnabled), 365);
    setCookie(COOKIE_NAMES.ALERTS_SIMULATION, String(updated.autoSimulation), 365);

    // Store full JSON config cookie
    setCookie(COOKIE_NAMES.ALERTS_CONFIG, JSON.stringify(updated), 365);

    return updated;
  } catch (err) {
    console.warn('[CookieUtils] Error saving alert config to cookies:', err);
    return { ...DEFAULT_ALERTS_CONFIG, ...config, source: 'cookie' };
  }
}

/**
 * Clear all alert cookies and reset preferences back to factory default (OFF).
 */
export function clearAlertCookies(): StoredAlertsConfig {
  deleteCookie(COOKIE_NAMES.ALERTS_ENABLED);
  deleteCookie(COOKIE_NAMES.ALERTS_SOUND);
  deleteCookie(COOKIE_NAMES.ALERTS_SIMULATION);
  deleteCookie(COOKIE_NAMES.ALERTS_CONFIG);
  return { ...DEFAULT_ALERTS_CONFIG };
}

/**
 * Inspect active cookie status for UI telemetry/badges.
 */
export function getAlertCookieMeta() {
  const enabledCookie = getCookie(COOKIE_NAMES.ALERTS_ENABLED);
  const configCookie = getCookie(COOKIE_NAMES.ALERTS_CONFIG);

  return {
    hasCookie: enabledCookie !== null,
    cookieValue: enabledCookie,
    isStoredInCookie: enabledCookie !== null,
    configExists: configCookie !== null,
    cookieName: COOKIE_NAMES.ALERTS_ENABLED,
    expirationDesc: '365 days (max-age=31536000s, SameSite=Lax)'
  };
}
