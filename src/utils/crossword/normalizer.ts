/**
 * Answer normalization for the puzzle engine.
 * 
 * Removes spaces, hyphens, apostrophes, punctuation.
 * Preserves Turkish characters (Ç, Ğ, İ, I, Ö, Ş, Ü).
 * Converts to uppercase.
 * 
 * Examples:
 *   "KARA DELİK"     → "KARADELİK"
 *   "NEWTON YASASI"  → "NEWTONYASASI"
 *   "d'Alembert"     → "DALEMBERT"
 */
export function normalizeAnswer(text: string): string {
  return text
    .toUpperCase()
    .replace(/[\s\-''.,:;!?()/\\""'']/g, '')
    .replace(/[^A-ZÇĞİIÖŞÜ0-9]/g, '');
}
