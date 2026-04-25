const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendEventNotificationEmail = async (recipients, event) => {
    try {
        const transporter = createTransporter();
        const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const mailOptions = {
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            bcc: recipients,
            subject: `🎉 New Event: ${event.title}`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">UniEvents</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0; font-size: 14px;">University Event Notification System</p>
          </div>
          ${event.poster ? `<img src="${event.poster}" alt="${event.title}" style="width: 100%; max-height: 300px; object-fit: cover;" />` : ''}
          <div style="padding: 40px;">
            <div style="display: inline-block; background: #f5f5f7; color: #1d1d1f; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px;">${event.department} · ${event.eventType}</div>
            <h2 style="color: #1d1d1f; font-size: 24px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.5px;">${event.title}</h2>
            <p style="color: #6e6e73; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">${event.description.substring(0, 200)}${event.description.length > 200 ? '...' : ''}</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f5f5f7; color: #6e6e73; font-size: 14px;">📅 Date & Time</td><td style="padding: 10px 0; border-bottom: 1px solid #f5f5f7; color: #1d1d1f; font-size: 14px; font-weight: 500;">${eventDate}</td></tr>
              <tr><td style="padding: 10px 0; color: #6e6e73; font-size: 14px;">📍 Venue</td><td style="padding: 10px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">${event.venue}</td></tr>
            </table>
            ${event.registrationLink ? `<a href="${event.registrationLink}" style="display: block; text-align: center; background: #0071e3; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin-bottom: 28px;">Register Now →</a>` : ''}
            <p style="color: #aaaaaa; font-size: 12px; text-align: center;">You are receiving this because you are registered at UniEvents. Log in to manage your notification preferences.</p>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email notification sent to ${recipients.length} recipients`);
    } catch (error) {
        console.error('Email send error:', error.message);
        // Don't throw — email failure should not block the API response
    }
};

module.exports = { sendEventNotificationEmail };
