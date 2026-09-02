/**
 * Dynamic Admin Path Configuration
 * Uses VITE_ADMIN_PATH environment variable with a safe fallback to '/admin'.
 */
const defaultSecretPath =
  "/Hw1b74gdYsID2BQ1CHlPgt3fhT1F1P7BHOArOw4JAf82KawjphE1xr5V1VEjsty75nWfBkSzIyM";
const rawAdminPath = (
  import.meta.env.VITE_ADMIN_PATH || defaultSecretPath
).trim();
// Strip potential surrounding quotes from .env
const sanitizedPath = rawAdminPath.replace(/^["']|["']$/g, '');
const normalizedPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;

export const ADMIN_BASE_PATH =
  normalizedPath.length > 1 && normalizedPath.endsWith('/')
    ? normalizedPath.slice(0, -1)
    : normalizedPath || defaultSecretPath;

/**
 * Returns a full route for the admin panel or any sub-route.
 * Example:
 *   getAdminRoute() -> '/<ADMIN_PATH>'
 *   getAdminRoute('/editor') -> '/<ADMIN_PATH>/editor'
 *   getAdminRoute('/entry/news') -> '/<ADMIN_PATH>/entry/news'
 */
export const getAdminRoute = (subpath: string = ''): string => {
  if (!subpath || subpath === '/' || subpath === '') return ADMIN_BASE_PATH;
  const cleanSub = subpath.startsWith('/') ? subpath : `/${subpath}`;
  return `${ADMIN_BASE_PATH}${cleanSub}`;
};
