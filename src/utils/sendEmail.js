import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass",
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || "noreply@multitask.com",
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new ApiError(500, "Error sending email");
  }
};

export { sendEmail };
