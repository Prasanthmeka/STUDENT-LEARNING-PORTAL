/**
 * Formats a submission timestamp string or Date object into a readable local date and time string.
 * Accurately parses UTC timestamps (even if PostgreSQL/Supabase returned them without a trailing 'Z')
 * and converts them properly to the user's local timezone.
 *
 * @param {string|Date} dateStr - The timestamp to format.
 * @returns {string} Formatted date/time (e.g., 'Oct 3, 2026, 4:27 PM') or 'N/A'.
 */
export const formatSubmissionDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const str = String(dateStr).trim();
  // If the timestamp does not have a timezone indicator (Z or +hh:mm or -hh:mm),
  // PostgreSQL TIMESTAMP without time zone stored it in UTC, so append 'Z' to treat as UTC.
  const normalized = (!str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) ? `${str}Z` : str;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
