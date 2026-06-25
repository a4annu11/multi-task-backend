import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP Connected Successfully");

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
