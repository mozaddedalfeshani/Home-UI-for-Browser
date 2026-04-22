import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  const mailOptions = {
    from: `"LaunchTab" <${process.env.EMAIL}>`,
    to,
    subject: "Verify your LaunchTab Account",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to LaunchTab!</h2>
        <p>Use the code below to verify your account and enable cross-device sync.</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #555; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #888; text-align: center;">This code will expire in 15 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
