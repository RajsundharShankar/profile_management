export function publicAssetUrl(path) {
  if (!path) return '';
  const base = import.meta.env.VITE_API_URL || '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('blob:')) return path;
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
