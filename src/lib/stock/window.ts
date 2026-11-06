/**
 * RestockWire's statistics window (owner, 2026-11-06, de-duplication step 2): every restock count, pattern, heatmap,
 * streak, ranking and sell-out figure on this site looks back 14 days, where the sister site looks back 30. The
 * numbers stay true (same confirmed restocks), they simply describe a different, more recent stretch — so the
 * two sites never print the same figure for the same store. Change it here only.
 */
export const STATS_DAYS = 14;
