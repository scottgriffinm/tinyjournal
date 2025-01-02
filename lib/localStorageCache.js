// lib/localStorageCache.js

/**
 * Retrieve data from localStorage by key.
 * If it's expired or doesn't exist, return null.
 */
export function getCache(key) {
    if (typeof window === 'undefined') return null;

    const cachedString = localStorage.getItem(key);
    if (!cachedString) {
        console.log("No cache found for key:", key);
        return null;
    }

    try {
        const cachedData = JSON.parse(cachedString);
        const { data, expiry } = cachedData;
        if (!expiry || Date.now() > expiry) {
            console.log("Cache expired for key:", key);
            localStorage.removeItem(key);
            return null;
        }

        console.log("Cache hit for key:", key, cachedData);
        return data;
    } catch (error) {
        console.error("Error parsing JSON from localStorage", error);
        return null;
    }
}
  
  /**
   * Store data in localStorage with an optional TTL (time-to-live).
   * `ttlMs` is the number of milliseconds from now until it expires.
   */
  export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
    if (typeof window === 'undefined') return;
    const expiry = Date.now() + ttlMs;
    const cachedObject = { data, expiry };
    localStorage.setItem(key, JSON.stringify(cachedObject));
    console.log("Cache set:", key, cachedObject);
}