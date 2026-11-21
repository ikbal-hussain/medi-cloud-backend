// True on Vercel or with NODE_ENV=production: there the local-dev fallbacks below must never be used.
export const isDeployed = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

/** A required setting when deployed; locally the dev fallback is fine. */
export function setting(name, devFallback) {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (isDeployed) throw new Error(`${name} is not set`);
  return devFallback;
}
