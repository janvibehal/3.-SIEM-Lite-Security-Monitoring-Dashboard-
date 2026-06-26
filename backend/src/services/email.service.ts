import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Verify your Email</title>
</head>

<body style="
margin:0;
padding:40px;
background:#020617;
font-family:Segoe UI,Arial,sans-serif;
color:#e2e8f0;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0"
style="
background:#0f172a;
border:1px solid #1e293b;
border-radius:18px;
overflow:hidden;
">

<tr>
<td style="
padding:28px;
background:#020617;
border-bottom:1px solid #1e293b;
">

<h1 style="
margin:0;
color:#22d3ee;
font-size:28px;
font-family:Consolas,monospace;
">
🛡 SIEM Lite
</h1>

<p style="
margin-top:8px;
color:#94a3b8;
font-size:14px;
">
Security Information & Event Management Platform
</p>

</td>
</tr>

<tr>

<td style="padding:40px;">

<h2 style="
margin-top:0;
color:white;
font-size:24px;
">
Verify your email address
</h2>

<p style="
line-height:1.7;
color:#cbd5e1;
">

Welcome to <strong>SIEM Lite</strong>.

Before you can access the Security Operations Dashboard, we need to verify your email address.

</p>

<div style="margin:40px 0;text-align:center;">

<a
href="${verificationUrl}"
style="
background:#06b6d4;
color:#020617;
padding:16px 34px;
text-decoration:none;
font-weight:bold;
border-radius:10px;
display:inline-block;
font-size:16px;
"
>

Verify Email

</a>

</div>

<div style="
background:#0b1220;
padding:18px;
border-left:4px solid #06b6d4;
border-radius:8px;
">

<p style="
margin:0;
color:#94a3b8;
font-size:14px;
">

This verification link expires in <strong>24 hours</strong>.

If you didn't create an account, you can safely ignore this email.

</p>

</div>

</td>

</tr>

<tr>

<td
style="
padding:24px;
text-align:center;
background:#020617;
border-top:1px solid #1e293b;
color:#64748b;
font-size:12px;
">

SIEM Lite • Security Monitoring Dashboard

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>
</html>
`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `
<!DOCTYPE html>
<html>

<body style="
margin:0;
padding:40px;
background:#020617;
font-family:Segoe UI,Arial,sans-serif;
color:#e2e8f0;
">

<table width="100%">
<tr>

<td align="center">

<table width="620"
style="
background:#0f172a;
border-radius:18px;
border:1px solid #1e293b;
overflow:hidden;
">

<tr>

<td
style="
padding:28px;
background:#020617;
border-bottom:1px solid #1e293b;
">

<h1 style="
margin:0;
font-family:Consolas,monospace;
color:#22d3ee;
">

🛡 SIEM Lite

</h1>

<p style="color:#94a3b8;">

Password Reset Request

</p>

</td>

</tr>

<tr>

<td style="padding:40px;">

<h2 style="color:white;">

Reset your password

</h2>

<p
style="
line-height:1.8;
color:#cbd5e1;
">

A password reset request was received for your account.

Click the button below to choose a new password.

</p>

<div
style="
text-align:center;
margin:40px 0;
">

<a
href="${resetUrl}"
style="
background:#ef4444;
padding:16px 36px;
color:white;
text-decoration:none;
font-weight:bold;
border-radius:10px;
display:inline-block;
">

Reset Password

</a>

</div>

<div
style="
background:#1e1b1b;
padding:18px;
border-left:4px solid #ef4444;
border-radius:8px;
">

<p
style="
margin:0;
color:#fca5a5;
">

⚠ This reset link expires in <strong>1 hour</strong>.

If you didn't request this password reset, please ignore this email.

</p>

</div>

</td>

</tr>

<tr>

<td
style="
padding:20px;
text-align:center;
background:#020617;
border-top:1px solid #1e293b;
color:#64748b;
font-size:12px;
">

SIEM Lite • Security Operations Center

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`,
  });
}
