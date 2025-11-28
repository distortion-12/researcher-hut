// Email sending utility using Brevo (formerly Sendinblue) API

export const sendOtpEmail = async (to: string, otp: string): Promise<boolean> => {
  const apiKey = process.env.BREVO_API_KEY;
  
  // Use your verified sender email here
  const senderEmail = "ramchouhan045@gmail.com"; 
  const senderName = "Researcher.Hut";

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey!,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject: '🔐 Your OTP Code - Researcher.Hut',
        htmlContent: `
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
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Brevo Error:', errorData);
      return false;
    }

    console.log(`✅ Email sent successfully to ${to}`);
    return true;

  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};