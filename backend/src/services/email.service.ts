import { Resend } from "resend";

export const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export async function sendVerificationEmail(
  email: string,
  token: string,
) {
  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify Email</h2>

      <p>Click below:</p>

      <a href="${verificationUrl}">
        Verify Email
      </a>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
) {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>

      <p>Click below to reset your password:</p>

      <a href="${resetUrl}">
        Reset Password
      </a>
    `,
  });
}