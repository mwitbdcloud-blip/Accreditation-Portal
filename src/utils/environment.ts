/**
 * Environment detection utility for Megaworld International Accreditation Portal.
 * Determines if the portal is running on a live/production deployment
 * (e.g. https://mwiaccreditationportal.netlify.app/ or custom domains)
 * versus a local development environment.
 */
export const isLiveEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();

  // Netlify live site check (e.g. mwiaccreditationportal.netlify.app)
  if (host.includes('netlify.app')) return true;

  // Official production domains
  if (host.includes('megaworld')) return true;

  // Other public cloud edge deployments
  if (host.includes('pages.dev') || host.includes('vercel.app')) return true;

  // Production build running outside localhost
  if (
    import.meta.env.PROD &&
    host !== 'localhost' &&
    host !== '127.0.0.1' &&
    !host.includes('ais-dev-')
  ) {
    return true;
  }

  return false;
};
