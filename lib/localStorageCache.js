// lib/localStorageCache.js

/**
 * Retrieve data from localStorage by key.
 * If it's expired or doesn't exist, return null.
 */
export function getCache(key) {
    if (typeof window === 'undefined') return null;
  
    const cachedString = localStorage.getItem(key);
    if (!cachedString) return null;
  
    try {
      const cachedData = JSON.parse(cachedString);
      const { data, expiry } = cachedData;
  
      // If no expiry is set or if now is past the expiry time, treat as invalid
      if (!expiry || Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
  
      return data;
    } catch (error) {
      console.error('Error parsing JSON from localStorage', error);
      return null;
    }
  }
  
  /**
   * Store data in localStorage with an optional TTL (time-to-live).
   * `ttlMs` is the number of milliseconds from now until it expires.
   */
  export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
    if (typeof window === 'undefined') return;
  
    // Calculate an expiry time
    const expiry = Date.now() + ttlMs;
    const cachedObject = { data, expiry };
  
    localStorage.setItem(key, JSON.stringify(cachedObject));
  }