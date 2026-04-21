import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export const FROM_EMAIL = "MonBaito <noreply@monbaito.fr>";
