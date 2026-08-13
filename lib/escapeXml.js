/**
 * Escapes XML special characters so untrusted user content can't break out of
 * the <document>/<flashcards> tags used by the AI routes (LLM01 hardening).
 */

/**
 * Escapes `&`, `<`, `>`, and `"` for safe embedding inside XML-ish prompt wrappers.
 * @param {unknown} value - Raw user or model-adjacent text; coerced with String().
 * @returns {string} Escaped text safe to place between delimiter tags.
 * @example
 * escapeXml('a <b> & "c"') // => 'a &lt;b&gt; &amp; &quot;c&quot;'
 */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
