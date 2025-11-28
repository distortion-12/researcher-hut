import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to: string, otp: string): Promise<boolean> => {
  try {
    // In production, 'from' must be a verified domain (e.g., 'noreply@yourdomain.com')
    // For testing, use 'onboarding@resend.dev'
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? 'Researcher.Hut <noreply@researcherhut.com>' 
      : 'Researcher.Hut <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to], // Resend expects an array
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
              <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">⏱️ This code expires in <strong>5 minutes</strong>.</p>
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