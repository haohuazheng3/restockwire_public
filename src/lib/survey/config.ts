/**
 * Neon database of the "where did you hear about us" answers (PickupChecker's scripts/survey-db.mjs); unset = the
 * survey never shows. Read here rather than in src/lib/env.ts, which is part of the runtime's code fingerprint
 * (poller/deps.json): the survey is the website's alone and must not make the runtime look out of date.
 */
export function surveyDatabaseUrl(): string {
  return process.env.SURVEY_DATABASE_URL ?? "";
}
