// ponytail: 60s in-flight memo for near-static reads (categories, settings, locations).
// Duplicate component fetches collapse into one request; reload to pick up admin edits.
const cache = new Map();

export function cached(key, load, ttl = 60000) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.promise;

  const entry = { at: Date.now(), promise: Promise.resolve().then(load) };
  entry.promise.catch(() => cache.delete(key));
  cache.set(key, entry);
  return entry.promise;
}
