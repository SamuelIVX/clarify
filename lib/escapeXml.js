/**
 * Escapes XML special characters so untrusted user content can't break out of
 * the <document>/<flashcards> tags used by the AI routes (LLM01 hardening).
 */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
