/**
 * Input Sanitization & Anti-XSS Helper for iPhone Lab UG
 */

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  return input
    // Truncate to max length to prevent payload inflation
    .slice(0, maxLength)
    // Remove HTML script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, style, object, embed tags
    .replace(/<(iframe|style|object|embed|form|link|meta)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Strip dangerous inline event handlers (e.g., onload=, onclick=)
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    // Strip javascript: pseudo-protocol
    .replace(/javascript:/gi, '')
    // Convert angle brackets to entities
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

/**
 * Phone Number Format Validator (Ugandan / International format)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  // Keep digits, +, space, hyphen
  const cleaned = phone.replace(/[^\d+\s-]/g, '').trim();
  return cleaned.slice(0, 30);
}
