export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${year}-${rand}`;
}
