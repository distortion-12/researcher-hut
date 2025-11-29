import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to: string, otp: string): Promise<boolean> => {
  try {
    // ✅ FINAL CONFIG: Using your real domain
    const fromEmail = 'Researcher.Hut <noreply@falsedistortion.me>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: '🔐 Your OTP Code - Researcher.Hut',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Researcher.Hut</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Verification Code</h2>
            <p style="color: #6b7280; font-size: 16px;">Please use the following OTP to log in:</p>
            <div style="background: #4f46e5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return false;
    }

    console.log(`✅ Email sent successfully to ${to} (ID: ${data?.id})`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};