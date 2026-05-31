const nodemailer = require('nodemailer');

/**
 * Sends a premium styled welcome email to newly registered students.
 * 
 * @param {string} toEmail - Student's email address
 * @param {string} fullName - Student's full name
 */
const sendWelcomeEmail = async (toEmail, fullName) => {
  try {
    let transporter;
    const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (isSmtpConfigured) {
      console.log('✉️ Configuring production SMTP transporter...');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log('✉️ No production SMTP credentials found. Initializing ethereal.email test server fallback...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to LearnoQube!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border: 1px solid #f1f5f9;
        }
        
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 48px 40px;
          text-align: center;
          position: relative;
        }
        
        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          margin: 0;
        }
        
        .logo-sub {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 6px;
          display: block;
        }
        
        .body-content {
          padding: 48px 40px;
        }
        
        h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin-top: 0;
          margin-bottom: 16px;
        }
        
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-top: 0;
          margin-bottom: 24px;
        }
        
        .highlight-text {
          font-weight: 700;
          color: #4f46e5;
        }
        
        .features-grid {
          background-color: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid #f1f5f9;
        }
        
        .feature-item {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
        }
        
        .feature-item:last-child {
          margin-bottom: 0;
        }
        
        .feature-icon {
          font-size: 20px;
          margin-right: 12px;
          line-height: 1;
        }
        
        .feature-title {
          font-weight: 700;
          font-size: 14px;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        
        .feature-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        
        .btn-container {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff !important;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          padding: 16px 36px;
          border-radius: 16px;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.15);
          transition: transform 0.2s ease;
        }
        
        .footer {
          background-color: #f8fafc;
          padding: 32px 40px;
          text-align: center;
          border-top: 1px solid #f1f5f9;
        }
        
        .footer-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #64748b;
        }
        
        .footer-text {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
          margin-top: 8px;
          margin-bottom: 0;
        }
        
        .support-link {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- HEADER -->
        <div class="header">
          <div class="logo-text">LearnoQube</div>
          <span class="logo-sub">Student Learning Portal</span>
        </div>
        
        <!-- BODY CONTENT -->
        <div class="body-content">
          <h1>Welcome aboard, ${fullName}! 🚀</h1>
          <p>
            We are thrilled to welcome you to the <span class="highlight-text">LearnoQube student community</span>! Your account has been registered successfully.
          </p>
          <p>
            LearnoQube is built to optimize your conceptual knowledge and master standard curriculum frameworks. Here is a quick look at what is waiting inside your personalized workspace:
          </p>
          
          <!-- FEATURES LIST -->
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon">📚</span>
              <div>
                <h4 class="feature-title">Dynamic Courses Grid</h4>
                <p class="feature-desc">Interactive curriculum progress tracking custom-tailored to your subjects.</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎥</span>
              <div>
                <h4 class="feature-title">Lessons & Live Classrooms</h4>
                <p class="feature-desc">Stream recorded tutor class sessions or join active live-stream rooms.</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📝</span>
              <div>
                <h4 class="feature-title">Auto-Graded Test Portal</h4>
                <p class="feature-desc">Complete diagnostic mock quizzes, obtain prompt percentage metrics, and review explanations.</p>
              </div>
            </div>
          </div>
          
          <p>
            <strong>First Step:</strong> When you log in, navigate to the <span class="highlight-text">Subscription Page</span> to select your active subjects. This will immediately customize and populate your courses grid, lessons, and reference study notebooks!
          </p>
          
          <!-- CALL TO ACTION -->
          <div class="btn-container">
            <a href="http://localhost:3000/login" class="btn-primary" target="_blank">Access Student Workspace</a>
          </div>
          
          <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">
            Happy learning,<br>
            <strong>The LearnoQube EdTech Team</strong>
          </p>
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
          <div class="footer-logo">LearnoQube Edumaster Pro</div>
          <p class="footer-text">
            This welcome confirmation was sent to <span style="color:#64748b; font-weight:600;">${toEmail}</span>.<br>
            If you need assistance, contact our technical desk at <a href="mailto:support@learnoqube.com" class="support-link">support@learnoqube.com</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LearnoQube Portal" <noreply@learnoqube.com>',
      to: toEmail,
      subject: 'Welcome to LearnoQube! 🚀 Student Portal Activation',
      html: welcomeHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Success! Student welcome email dispatched successfully: ${info.messageId}`);
    
    if (!isSmtpConfigured) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('------------------------------------------------------------');
      console.log('✉️ LOCAL DEVELOPMENT TESTING DETECTED (Simulated Ethereal)');
      console.log(`✉️ Click here to preview welcome email in browser:\n${previewUrl}`);
      console.log('------------------------------------------------------------');
    }
    return info;
  } catch (err) {
    console.error('❌ Failed to dispatch student welcome email:', err);
    throw err;
  }
};

module.exports = { sendWelcomeEmail };
