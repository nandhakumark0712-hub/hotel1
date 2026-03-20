// ── Branding Constants ──────────────────────────────────────────────────────
const BRAND_NAME = 'NK Hotel Bookings';
const PRIMARY_COLOR = '#FF5A36';

// ── Email Verification Template ─────────────────────────────────────────────
exports.verifyEmailTemplate = (url) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
        .header { background-color: ${PRIMARY_COLOR}; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background-color: #ffffff; padding: 40px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; line-height: 1.6; }
        .btn { display: inline-block; padding: 14px 28px; background-color: ${PRIMARY_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0">Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Welcome to <strong>${BRAND_NAME}</strong>!</p>
            <p>We're excited to have you on board. Please click the button below to verify your email address and activate your account.</p>
            <div style="text-align: center;">
                <a href="${url}" class="btn">Confirm Email Address</a>
            </div>
            <p style="margin-top: 40px; font-size: 14px; color: #888; border-top: 1px solid #f0f0f0; pt-20">
                If you did not create an account with us, you can safely ignore this email.
            </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// ── Password Reset Template ────────────────────────────────────────────────
exports.resetPasswordTemplate = (url) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
        .header { background-color: #2D3748; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background-color: #ffffff; padding: 40px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; line-height: 1.6; }
        .btn { display: inline-block; padding: 14px 28px; background-color: ${PRIMARY_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0">Password Reset</h1>
        </div>
        <div class="content">
            <p>We received a request to reset the password for your <strong>${BRAND_NAME}</strong> account.</p>
            <p>Click the button below to set a new password. This link is only valid for 15 minutes.</p>
            <div style="text-align: center;">
                <a href="${url}" class="btn">Reset My Password</a>
            </div>
            <p style="margin-top: 40px; font-size: 14px; color: #888;">
                If you didn't request this, contact us immediately. Otherwise, no action is needed.
            </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// ── Booking Confirmation Template ──────────────────────────────────────────
exports.bookingConfirmationTemplate = ({ userName, hotelName, checkIn, checkOut, bookingId, totalPrice }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: ${PRIMARY_COLOR}; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Reservation Confirmed!</h1>
        </div>
        <div style="padding: 30px;">
            <p>Hi ${userName || 'Guest'},</p>
            <p>Pack your bags! Your booking at <strong>${hotelName}</strong> is confirmed. Below are your booking details:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #666;">Booking ID:</td><td style="padding: 8px 0; font-weight: bold;">#${bookingId.slice(-8).toUpperCase()}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Hotel Name:</td><td style="padding: 8px 0; font-weight: bold;">${hotelName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Check-In:</td><td style="padding: 8px 0; font-weight: bold;">${checkIn}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Check-Out:</td><td style="padding: 8px 0; font-weight: bold;">${checkOut}</td></tr>
                    <tr style="border-top: 1px solid #eee;"><td style="padding: 15px 0 0; color: #666; font-size: 18px;">Total Paid:</td><td style="padding: 15px 0 0; color: ${PRIMARY_COLOR}; font-weight: 800; font-size: 20px;">₹${totalPrice}</td></tr>
                </table>
            </div>

            <p>We hope you enjoy your stay. You can view your invoice and manage your booking via our website.</p>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #888; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

// ── Payment Confirmation Template ──────────────────────────────────────────
exports.paymentConfirmationTemplate = ({ userName, paymentId, amount, hotelName }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: #059669; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Payment Successful ✅</h1>
        </div>
        <div style="padding: 30px;">
            <p>Hello ${userName || 'User'},</p>
            <p>This email is to confirm that we have received your payment for your stay at <strong>${hotelName}</strong>.</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #d1fae5;">
                <p style="margin: 0; color: #064e3b; font-size: 14px; margin-bottom: 10px;">RECEIPT DETAILS</p>
                <div style="font-size: 24px; font-weight: 800; color: #059669; margin-bottom: 5px;">₹${amount}</div>
                <div style="color: #6b7280; font-size: 12px;">Transaction ID: ${paymentId}</div>
            </div>

            <p>Your booking is now fully confirmed. You can access your digital invoice anytime in your dashboard.</p>
        </div>
    </div>
</body>
</html>
`;

// ── Booking Cancellation Template ──────────────────────────────────────────
exports.cancellationTemplate = ({ userName, bookingId, hotelName, refundInfo }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: #374151; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Booking Cancelled</h1>
        </div>
        <div style="padding: 30px;">
            <p>Dear ${userName || 'valued customer'},</p>
            <p>Your reservation at <strong>${hotelName}</strong> has been successfully cancelled as per your request.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #fee2e2;">
                <p style="margin: 0; color: #991b1b; font-weight: bold;">Cancellation Summary:</p>
                <ul style="color: #4b5563; margin-top: 10px;">
                    <li>Booking Reference: #${bookingId.slice(-8).toUpperCase()}</li>
                    <li>Status: Cancelled</li>
                    <li>Refund Status: ${refundInfo || 'Subject to policy'}</li>
                </ul>
            </div>

            <p>We're sorry you won't be staying with us this time. We hope to see you again soon!</p>
        </div>
    </div>
</body>
</html>
`;

// ── Promotional Offer Template ─────────────────────────────────────────────
exports.promotionalTemplate = ({ title, discount, offerLink, message, hotelName }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333; line-height: 1.5; padding: 0; margin: 0;">
    <div style="max-width: 600px; margin: 30px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #FF5A36 0%, #FF8C73 100%); padding: 60px 20px; text-align: center; color: white;">
            <div style="font-size: 50px; margin-bottom: 20px;">🎉</div>
            ${hotelName ? `<div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; margin-bottom: 8px;">${hotelName}</div>` : ''}
            <h1 style="margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase;">${title}</h1>
            <div style="font-size: 80px; font-weight: 900; margin: 10px 0;">${discount}% OFF</div>
            <p style="font-size: 18px; opacity: 0.9;">Exclusive Deal from ${BRAND_NAME}</p>
        </div>
        <div style="padding: 40px; text-align: center; background: white;">
            <h2 style="color: #1a202c; font-size: 24px; margin-bottom: 16px;">Don't Miss Out!</h2>
            <p style="color: #4a5568; margin-bottom: 30px; font-size: 16px; line-height: 1.8;">${message || 'Adventure awaits. Use this special discount for your next gateway and experience luxury for less.'}</p>
            <a href="${offerLink || '#'}" style="display: inline-block; padding: 18px 45px; background: #FF5A36; color: white; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 18px; letter-spacing: 1px;">BOOK NOW</a>
        </div>
    </div>
</body>
</html>
`;
