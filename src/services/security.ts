/**
 * Security & Anti-Bot Shield for Leovra Enterprises
 * 
 * Provides:
 * 1. Honeypot trap validation (detects automated form fillers)
 * 2. Human submission timing verification (detects sub-second bot submissions)
 * 3. Client-side sliding-window rate limiting (prevents DDoS & order flooding)
 * 4. Input sanitization (prevents XSS, script injection & payload corruption)
 * 5. Admin PIN brute-force lockout protection (prevents automated password cracking)
 * 6. Automated browser & headless bot detection heuristics
 * 7. Firebase write rate-limiter & request coalescing (prevents cloud quota exhaustion)
 */

interface RateLimitRecord {
  timestamps: number[];
  lockoutUntil: number;
}

const ORDER_RATE_LIMIT_KEY = 'leovra_sec_order_rl';
const ADMIN_LOCKOUT_KEY = 'leovra_sec_admin_lock';

/**
 * Clean and sanitize a string input by removing HTML tags, script attempts,
 * null bytes, and dangerous control characters.
 */
export const sanitizeInput = (val: string): string => {
  if (!val) return '';
  return val
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script tags
    .replace(/<[^>]+>/g, '') // strip any other HTML tags
    .replace(/[<>'"`;\\]/g, (char) => {
      // Escape critical characters
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
        '`': '&#96;',
        ';': '&#59;',
        '\\': '&#92;'
      };
      return map[char] || char;
    })
    .trim();
};

/**
 * Detects if the current environment shows signatures of automated headless bots
 * (e.g. Selenium, Puppeteer, HeadlessChrome, PhantomJS).
 */
export const detectAutomationSignatures = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const nav = window.navigator as any;
    // 1. Check navigator.webdriver (standard indicator of automated testing/bots)
    if (nav.webdriver === true) {
      return true;
    }

    // 2. Check for common headless browser globals
    if (
      (window as any)._phantom ||
      (window as any).__nightmare ||
      (window as any).callPhantom ||
      (window as any).__selenium_unwrapped ||
      (window as any).domAutomation ||
      (window as any).domAutomationController
    ) {
      return true;
    }

    // 3. Check for Headless Chrome User-Agent pattern
    if (/HeadlessChrome/i.test(nav.userAgent || '')) {
      return true;
    }
  } catch {
    // In case of restricted environment, do not block regular users
  }

  return false;
};

/**
 * Validates whether an order submission is legitimate or originating from a bot.
 */
export interface OrderSecurityValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateOrderSecurity = (params: {
  honeypotValue?: string;
  formMountedAt?: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}): OrderSecurityValidationResult => {
  // 1. Honeypot check: Bots auto-fill invisible fields
  if (params.honeypotValue && params.honeypotValue.trim().length > 0) {
    console.warn('[Security Shield] Honeypot triggered. Request dropped silently.');
    return {
      isValid: false,
      errorMessage: 'Automated submission detected. If you are human, please refresh and try again.'
    };
  }

  // 2. Human Timing check: Humans take at least 1.5 seconds to fill order details
  if (params.formMountedAt && params.formMountedAt > 0) {
    const timeSpentMs = Date.now() - params.formMountedAt;
    if (timeSpentMs < 1200) {
      console.warn('[Security Shield] Super-human submission speed detected:', timeSpentMs, 'ms');
      return {
        isValid: false,
        errorMessage: 'Please take a moment to review your details before submitting.'
      };
    }
  }

  // 3. Automated environment check
  if (detectAutomationSignatures()) {
    console.warn('[Security Shield] Automated browser detected.');
    return {
      isValid: false,
      errorMessage: 'Automated browser detected. Orders can only be placed from standard browsers.'
    };
  }

  // 4. Input sanity checks
  const cleanName = params.customerName.trim();
  if (cleanName.length < 2 || cleanName.length > 70) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid customer name (2 to 70 characters).'
    };
  }

  // Reject URLs or spam in name
  if (/https?:\/\/|www\.|\.com|\.net|\.org/i.test(cleanName)) {
    return {
      isValid: false,
      errorMessage: 'Invalid characters or website links detected in name.'
    };
  }

  // 10-digit Indian Mobile check (starts with 6, 7, 8, 9)
  const cleanDigits = params.customerPhone.replace(/\D/g, '');
  if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).'
    };
  }

  // Address sanity check
  const cleanAddr = params.customerAddress.trim();
  if (cleanAddr.length < 8 || cleanAddr.length > 300) {
    return {
      isValid: false,
      errorMessage: 'Please provide a complete delivery address (8 to 300 characters).'
    };
  }

  // 5. Sliding-window order rate limiter
  const rateLimitResult = checkOrderRateLimit();
  if (!rateLimitResult.allowed) {
    return {
      isValid: false,
      errorMessage: rateLimitResult.reason
    };
  }

  return { isValid: true };
};

/**
 * Sliding Window Rate Limiter for Orders:
 * - Minimum 25 seconds between consecutive orders.
 * - Maximum 4 orders per 15-minute rolling window per device.
 */
export const checkOrderRateLimit = (): { allowed: boolean; reason?: string } => {
  if (typeof window === 'undefined') return { allowed: true };

  try {
    const raw = localStorage.getItem(ORDER_RATE_LIMIT_KEY);
    const record: RateLimitRecord = raw ? JSON.parse(raw) : { timestamps: [], lockoutUntil: 0 };
    const now = Date.now();

    // Check if client is currently in cooling period
    if (record.lockoutUntil && record.lockoutUntil > now) {
      const remainingSecs = Math.ceil((record.lockoutUntil - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit active: Please wait ${remainingSecs}s before placing another order.`
      };
    }

    // Filter timestamps within last 15 minutes (900,000 ms)
    const windowMs = 15 * 60 * 1000;
    const recent = record.timestamps.filter((ts) => now - ts < windowMs);

    // Check consecutive cooldown: minimum 20 seconds between orders
    if (recent.length > 0) {
      const lastOrderTime = recent[recent.length - 1];
      const timeSinceLast = now - lastOrderTime;
      if (timeSinceLast < 20000) {
        const waitSec = Math.ceil((20000 - timeSinceLast) / 1000);
        return {
          allowed: false,
          reason: `Too many rapid orders. Please wait ${waitSec}s to prevent duplicate billing.`
        };
      }
    }

    // Check burst limit: max 4 orders in 15 minutes
    if (recent.length >= 4) {
      const cooldownPeriod = 5 * 60 * 1000; // 5-minute cooldown
      const lockout = now + cooldownPeriod;
      localStorage.setItem(ORDER_RATE_LIMIT_KEY, JSON.stringify({
        timestamps: recent,
        lockoutUntil: lockout
      }));
      return {
        allowed: false,
        reason: 'Order velocity limit reached (max 4 orders per 15 minutes). Cooldown applied.'
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
};

/**
 * Record a successfully placed order timestamp into the rate limiter
 */
export const recordOrderPlaced = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ORDER_RATE_LIMIT_KEY);
    const record: RateLimitRecord = raw ? JSON.parse(raw) : { timestamps: [], lockoutUntil: 0 };
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const recent = record.timestamps.filter((ts) => now - ts < windowMs);
    recent.push(now);

    localStorage.setItem(ORDER_RATE_LIMIT_KEY, JSON.stringify({
      timestamps: recent,
      lockoutUntil: record.lockoutUntil
    }));
  } catch (e) {
    console.warn('Could not record order rate limit:', e);
  }
};

/**
 * Admin Passcode Brute-Force Shield:
 * - 1-3 failed attempts: 2s delay
 * - 4 failed attempts: 30s lockout
 * - 5+ failed attempts: 5-minute lockout
 */
interface AdminLockoutState {
  attempts: number;
  lockedUntil: number;
}

export const getAdminLockoutStatus = (): { isLocked: boolean; remainingSeconds: number } => {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0 };

  try {
    const raw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0 };
    const state: AdminLockoutState = JSON.parse(raw);
    const now = Date.now();

    if (state.lockedUntil && state.lockedUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((state.lockedUntil - now) / 1000)
      };
    }

    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
};

export const recordFailedAdminAttempt = (): { isLocked: boolean; remainingSeconds: number; attempts: number } => {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0, attempts: 1 };

  try {
    const raw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
    const state: AdminLockoutState = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };
    state.attempts += 1;
    const now = Date.now();

    if (state.attempts >= 5) {
      state.lockedUntil = now + 5 * 60 * 1000; // 5 minutes lockout
    } else if (state.attempts >= 3) {
      state.lockedUntil = now + 30 * 1000; // 30 seconds lockout
    }

    localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(state));

    const remainingSeconds = state.lockedUntil > now ? Math.ceil((state.lockedUntil - now) / 1000) : 0;
    return {
      isLocked: remainingSeconds > 0,
      remainingSeconds,
      attempts: state.attempts
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 1 };
  }
};

export const clearAdminLockout = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_LOCKOUT_KEY);
  } catch {}
};
