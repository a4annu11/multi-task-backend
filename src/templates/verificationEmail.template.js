export const verificationEmailTemplate = (username, verificationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Email Verification</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7fc;
  font-family:Arial, Helvetica, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 20px;">

<table width="600" cellpadding="0" cellspacing="0"
style="
  background:#ffffff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 8px 30px rgba(0,0,0,0.08);
">

<!-- Header -->
<tr>
<td
style="
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  padding:40px;
  text-align:center;
">
<h1
style="
  color:white;
  margin:0;
  font-size:32px;
">
Welcome 
</h1>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px;">

<h2
style="
  margin-top:0;
  color:#111827;
">
Hello ${username},
</h2>

<p
style="
  color:#6b7280;
  line-height:1.8;
  font-size:16px;
">
Thank you for registering. To verify your email address,
please use the verification code below.
</p>

<div
style="
  text-align:center;
  margin:35px 0;
">
<span
style="
  display:inline-block;
  background:#eef2ff;
  color:#4338ca;
  font-size:34px;
  font-weight:700;
  letter-spacing:8px;
  padding:18px 30px;
  border-radius:12px;
">
${verificationCode}
</span>
</div>

<p
style="
  color:#6b7280;
  line-height:1.8;
">
This code will expire in
<strong>24 hours</strong>.
</p>

<p
style="
  color:#6b7280;
  line-height:1.8;
">
If you did not create this account, you can safely ignore
this email.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td
style="
  background:#f9fafb;
  text-align:center;
  padding:25px;
  color:#9ca3af;
  font-size:13px;
">
© ${new Date().getFullYear()} Your App.
All rights reserved.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};
