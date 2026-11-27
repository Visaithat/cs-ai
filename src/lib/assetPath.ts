/**
 * Prefix static public asset paths with `NEXT_PUBLIC_BASE_PATH` (e.g. "/cs-ai" on GitHub Pages)
 * so logos, SVG diagrams, and editorial covers resolve on both localhost and project subpaths.
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export function assetPath(path: string): string {
  if (!path.startsWith("/") || !BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
