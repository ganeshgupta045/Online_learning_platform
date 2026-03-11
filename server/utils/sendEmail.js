const nodemailer = require('nodemailer');

// Export a function that creates a test account if genuine credentials aren't provided
const sendEmail = async (options) => {
    let transporter;

    // Use environment variables if they exist (for production)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback to ethereal for local testing without setup 
        // Ethereal is a fake SMTP service aimed at developers
        console.log("No SMTP credentials found in .env, generating Ethereal test account...");
        let testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Online Learning Platform'} <${process.env.FROM_EMAIL || 'noreply@onlinelearning.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Allow sending HTML emails as well
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);

    // Preview only available when sending through an Ethereal account
    if (!process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
