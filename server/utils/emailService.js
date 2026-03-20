const nodemailer = require('nodemailer');

// ── Nodemailer Transporter ──────────────────────────────────────────────────
// Uses environment variables stored in .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    }
});

/**
 * sendEmail
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html    - HTML message content
 */
const sendEmail = async ({ to, subject, html }) => {
    // Check if credentials are set
    if (!(process.env.EMAIL_USER || process.env.SMTP_USER) || !(process.env.EMAIL_PASS || process.env.SMTP_PASS)) {
        console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not set — skipping email delivery.');
        return;
    }

    try {
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'NK Hotel Bookings'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Message sent: %s`, info.messageId);
        return info;
    } catch (error) {
        console.error('[EmailService] Error occurred while sending email:', error.message);
        throw error;
    }
};

module.exports = sendEmail;
