const rateLimitMap = new Map(); // Shared Map for all routes


function rateLimiter(namespace, identifier, maxRequests, timeWindow) {
  const now = Date.now();
  const key = `${namespace}:${identifier}`; // Create a unique key per namespace and user

  // Get existing timestamps or initialize a new array
  const requestTimestamps = rateLimitMap.get(key) || [];

  // Filter out timestamps outside the time window
  const validTimestamps = requestTimestamps.filter((timestamp) => now - timestamp < timeWindow);

  // Check if the request exceeds the rate limit
  if (validTimestamps.length >= maxRequests) {
    return false; // Request not allowed
  }

  // Add the current timestamp and update the Map
  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);

  return true; // Request allowed
}

export default rateLimiter;