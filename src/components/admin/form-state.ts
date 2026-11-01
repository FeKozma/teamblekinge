/**
 * What an admin server action returns to <AdminForm>: a message for the toast
 * on success, or errors keyed by field name (list rows: `${list}.${i}.${field}`).
 */
export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
} | null;
