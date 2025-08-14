const nodemailer = require('nodemailer');

// Create a test account (for development)
// In production, you would use real SMTP credentials
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal test account created:', testAccount.user);
    return testAccount;
  } catch (error) {
    console.error('❌ Error creating test account:', error);
    console.log('📧 Falling back to console logging for email simulation');
    return null;
  }
};

// Create Gmail transporter with your credentials
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'jamadarvasim88@gmail.com',
      pass: 'scub xvkw ptti nrkb', // App password
    },
  });
};

// Create transporter
const createTransporter = async () => {
  try {
    // Use Gmail transporter
    const transporter = createGmailTransporter();
    
    // Verify the connection
    await transporter.verify();
    console.log('📧 Email transporter verified successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    console.log('📧 Falling back to console logging for email simulation');
    
    // Fallback to console logging for development
    return {
      sendMail: async (options) => {
        console.log('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html
        });
        return { messageId: 'console-log' };
      }
    };
  }
};

// Send welcome email to hotel owner
const sendWelcomeEmail = async (hotelData) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"Miracle Infotech" <jamadarvasim88@gmail.com>',
      to: hotelData.email,
      subject: 'Welcome to Miracle Infotech Lodging Management System!',
      text: `
Dear ${hotelData.hotel_name} Team,

Welcome to the Lodging Management System! Your hotel has been successfully registered.

Hotel Details:
- Hotel Name: ${hotelData.hotel_name}
- Email: ${hotelData.email}
- Phone: ${hotelData.phone || 'Not provided'}
- Address: ${hotelData.address || 'Not provided'}

Login Credentials:
- Username: ${hotelData.email}
- Password: ${hotelData.password}

You can now login to your hotel dashboard using these credentials.

Best regards,
Lodging Management System Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Lodging Management System</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .credentials { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Miracle Infotech Lodging Management System!</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${hotelData.hotel_name}</strong> Team,</p>
            
            <p>Welcome to the Miracle Infotech Lodging Management System! Your hotel has been successfully registered.</p>
            
            <h3>Hotel Details:</h3>
            <ul>
                <li><strong>Hotel Name:</strong> ${hotelData.hotel_name}</li>
                <li><strong>Email:</strong> ${hotelData.email}</li>
                <li><strong>Phone:</strong> ${hotelData.phone || 'Not provided'}</li>
                <li><strong>Address:</strong> ${hotelData.address || 'Not provided'}</li>
            </ul>
            
            <div class="credentials">
                <h3>Login Credentials:</h3>
                <p><strong>Username:</strong> ${hotelData.email}</p>
                <p><strong>Password:</strong> ${hotelData.password}</p>
            </div>
            
            <p>You can now login to your hotel dashboard using these credentials.</p>
            
            <p>Best regards,<br>
            Miracle Infotech Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Miracle Infotech. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail
}; 