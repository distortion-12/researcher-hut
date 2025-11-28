import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD, // Use App Password, not regular password
  },
});

export const sendOtpEmail = async (to: string, otp: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Researcher.Hut" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: '🔐 Your OTP Code - Researcher.Hut',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔬 Researcher.Hut</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Verification Code</h2>
            <p style="color: #6b7280; font-size: 16px;">Use the following OTP to complete your verification:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">⏱️ This code expires in <strong>5 minutes</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Researcher.Hut. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};
