
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD
  }
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${env.WEB_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'SIGMS Password Reset',
    text: `Use this link to reset your SIGMS password. It expires in 15 minutes: ${resetUrl}`,
    html: `
      <h2>SIGMS Password Reset</h2>
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 15 minutes. If you did not request this, ignore this email.</p>
    `
  });
};
