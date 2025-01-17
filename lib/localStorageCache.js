// lib/localStorageCache.js

/**
 * Retrieves data from localStorage by key.
 * Returns the data if it exists and has not expired; otherwise, returns `null`.
 * Removes the cache from localStorage if it is expired.
 *
 * @param {string} key - The localStorage key to retrieve the cached data from.
 * @returns {Object|null} - The cached data if valid, or `null` if it doesn't exist or is expired.
 *
 * @example
 * // Retrieve data from the cache
 * const userSettings = getCache("userSettings");
 * if (userSettings) {
 *   console.log("Cached data:", userSettings);
 * } else {
 *   console.log("No valid cache found.");
 * }
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
 * Stores data in localStorage with an optional time-to-live (TTL).
 * Automatically sets an expiry time for the cached data.
 *
 * @param {string} key - The localStorage key to store the data under.
 * @param {Object} data - The data to store in the cache.
 * @param {number} [ttlMs=300000] - Time-to-live in milliseconds (default is 5 minutes).
 *
 * @example
 * // Store user preferences with a TTL of 10 minutes
 * setCache("userPreferences", { theme: "dark" }, 10 * 60 * 1000);
 */
export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
    if (typeof window === 'undefined') return;
    const expiry = Date.now() + ttlMs;
    const cachedObject = { data, expiry };
    localStorage.setItem(key, JSON.stringify(cachedObject));
    console.log("Cache set:", key, cachedObject);
}


/**
 * Updates or adds an item to a cached object in localStorage.
 * Initializes or resets the cache if it doesn't exist or is expired.
 *
 * @param {string} key - The localStorage key to update.
 * @param {Object} newItem - The new item to add or update in the cached object.
 * @param {number} [ttlMs=300000] - Time-to-live in milliseconds (default is 5 minutes).
 *
 * @example
 * // Add or update a cache item
 * updateCache("userSettings", { theme: "dark" });
 */
export function updateCache(key, newItem, ttlMs = 5 * 60 * 1000) {
    if (typeof window === 'undefined') return;

    const cachedString = localStorage.getItem(key);
    let cachedData;
    let isExpired = false;
    let cacheExists = true;

    if (cachedString) {
        try {
            const parsedCache = JSON.parse(cachedString);
            const { data, expiry } = parsedCache;

            // Check if the cache is expired
            if (!expiry || Date.now() > expiry) {
                console.log("Cache expired, not updating the cache for key:", key);
                isExpired = true;
            } else {
                cachedData = data; // Use existing cached data
            }
        } catch (error) {
            console.error("Error parsing existing cache for key:", key, error);
            cacheExists = false; // Treat as if no valid cache exists
        }
    } else {
        console.log("No cache found for key:", key);
        cacheExists = false; // No cache exists
    }

    if (isExpired || !cacheExists) return; // Do nothing if cache is expired or doesn't exist

    // Handle journalEntries as a list
    if (key === "journalEntries") {
        if (!Array.isArray(cachedData)) {
            console.warn(`Expected an array for key "${key}", resetting to empty array.`);
            cachedData = [];
        }
        cachedData.unshift(newItem); // Add the new item to the array
    } else {
        // Handle other keys as objects
        cachedData = { ...cachedData, ...newItem };
    }

    // Save the updated cache back with the new expiry time
    const expiry = Date.now() + ttlMs;
    const updatedCache = { data: cachedData, expiry };
    localStorage.setItem(key, JSON.stringify(updatedCache));
    console.log("Cache updated:", key, updatedCache);
}