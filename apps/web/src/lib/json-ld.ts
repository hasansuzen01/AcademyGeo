/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is not enough: it leaves `<` and `>` as they are, so
 * a value containing `</script>` closes the tag it was written into and the
 * rest is parsed as markup. Escaping them as unicode keeps the JSON identical
 * to a parser while making it inert to the HTML tokeniser.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
