// src/email.ts
import nodemailer from "nodemailer";

export type EmailInput = {
  to: string;
  subject: string;
  body: string;
};

export async function sendEmail({ to, subject, body }: EmailInput): Promise<{ ok: boolean; messageId?: string; error?: unknown }> {
  try {
    // Use environment variables for config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // set true if port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: body,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error("sendEmail failed:", err);
    return { ok: false, error: err };
  }
}
