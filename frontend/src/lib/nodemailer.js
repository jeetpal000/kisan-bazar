import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"KisanBazar" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
