export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function renderHighlightedMatch(
  text: string,
  searchText: string,
  highlightClassName = "font-semibold text-primary",
) {
  const trimmed = searchText.trim();
  if (!trimmed) return text;

  const matcher = new RegExp(`(${escapeRegExp(trimmed)})`, "ig");
  const parts = text.split(matcher);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.toLowerCase() !== trimmed.toLowerCase()) return part;
    return (
      <span key={`${part}-${i}`} className={highlightClassName}>
        {part}
      </span>
    );
  });
}

export function isUrl(input: string): boolean {
  if (input.startsWith("http://") || input.startsWith("https://")) return true;
  const urlPattern =
    /\.(com|org|net|io|dev|app|co|edu|gov|mil|int|biz|info|name|pro|aero|coop|museum|travel|jobs|mobi|asia|cat|tel|post|xxx|arpa|root|local|onion|bit|example|invalid|test|localhost)(\.[a-z]{2,})?(\/.*)?$/i;
  return urlPattern.test(input);
}
