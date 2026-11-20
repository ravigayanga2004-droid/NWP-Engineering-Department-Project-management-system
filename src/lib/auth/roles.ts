/** Roles stored in profiles.role (Postgres enum app_role). Keep in sync with the database. */
export const APP_ROLES = [
  "subject_clerk",
  "designer",
  "draughtsman",
  "ho_to",
  "de_to",
  "de_engineer",
  "head_engineer",
  "admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const isAppRole = (value: unknown): value is AppRole =>
  typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
