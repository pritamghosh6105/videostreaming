import nodemailer from 'nodemailer';

// Create transporter using SMTP environment variables
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn(`[Mailer Warning] EMAIL_USER/EMAIL_PASS not set in .env. Email to ${to} was not sent via SMTP.`);
      return false;
    }

    const info = await transporter.sendMail({
      from: `"ViewFlow Security" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Mailer] Email dispatched to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Mailer Error] Failed to send email to ${to}:`, error.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, code) => {
  const subject = 'ViewFlow - Password Reset Verification Code';
  const text = `Your ViewFlow 6-digit password reset code is: ${code}. This code expires in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 480px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
      <h2 style="color: #7c3aed; text-align: center; margin-bottom: 24px;">ViewFlow Security</h2>
      <p style="font-size: 14px; color: #3f3f46;">Hello,</p>
      <p style="font-size: 14px; color: #3f3f46;">You requested a password reset for your ViewFlow account. Enter the 6-digit verification code below to reset your password:</p>
      <div style="background: #f4f4f5; padding: 18px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #09090b; margin: 24px 0;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #71717a;">This code will expire in 15 minutes. If you did not request this password reset, please ignore this email or contact support.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html, text });
};

export const sendRegistrationVerificationEmail = async (email, code) => {
  const subject = 'ViewFlow - Verify Your Channel Account';
  const text = `Your ViewFlow 6-digit account verification code is: ${code}. This code expires in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 480px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
      <h2 style="color: #7c3aed; text-align: center; margin-bottom: 24px;">Welcome to ViewFlow</h2>
      <p style="font-size: 14px; color: #3f3f46;">Hello,</p>
      <p style="font-size: 14px; color: #3f3f46;">Thank you for registering your channel on ViewFlow! Please enter the 6-digit verification code below to complete registration:</p>
      <div style="background: #f4f4f5; padding: 18px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #09090b; margin: 24px 0;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #71717a;">This code will expire in 15 minutes.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html, text });
};
