import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1F44 0%, #1A3A6E 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin:0;color:#D4A017;font-size:28px;font-weight:700;letter-spacing:-0.5px;">YIF Capital</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;letter-spacing:0.5px;">SECURE PASSWORD RESET</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0A1F44;font-size:22px;font-weight:600;">Reset Your Password</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your YIF Capital account. Click the button below to create a new password.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4A017 0%,#c49415 100%);color:#0A1F44;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:12px;letter-spacing:0.3px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.6;">
                This link will expire in <strong style="color:#0A1F44;">1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${resetUrl}" style="color:#D4A017;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                &copy; ${new Date().getFullYear()} YIF Capital. All rights reserved.<br>
                Dar es Salaam, Tanzania
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"YIF Capital" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Reset Your Password — YIF Capital",
        html: htmlContent,
    });
}
