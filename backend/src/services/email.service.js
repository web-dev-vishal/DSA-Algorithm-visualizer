import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });

    // Verify connection on startup
    if (config.env !== 'test') {
      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email service SMTP connection failed:', error);
        } else {
          logger.info('Email service SMTP connection successful');
        }
      });
    }
  }

  async sendMail({ to, subject, html }) {
    try {
      const mailOptions = {
        from: `"${config.email.from.split('@')[0].toUpperCase()}" <${config.email.from}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.debug(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error(`Email send error: ${error.message}`);
    }
  }

  // ── Welcome Email ──────────────────────────────────────────────────
  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Welcome to AlgoViz, ${user.name}!</h2>
        <p>We are thrilled to have you join us. AlgoViz helps you visualize data structures and algorithms in real time with step-by-step logic tracing.</p>
        <p>Get started by exploring our visualizer dashboard!</p>
        <a href="${config.clientUrl}/app" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Launch Visualizer</a>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">If you did not create this account, please ignore this email.</p>
      </div>
    `;
    return this.sendMail({ to: user.email, subject: 'Welcome to AlgoViz!', html });
  }

  // ── Verification Email ──────────────────────────────────────────────
  async sendVerificationEmail(user, token) {
    const url = `${config.clientUrl}/verify-email?token=${token}&email=${user.email}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Verify Your Email Address</h2>
        <p>Please confirm your email address to unlock all premium visualizer features.</p>
        <p>Click the button below to verify your account:</p>
        <a href="${url}" style="display: inline-block; background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">Or copy and paste this link in your browser: <br/><a href="${url}">${url}</a></p>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">This link expires in 24 hours.</p>
      </div>
    `;
    return this.sendMail({ to: user.email, subject: 'Verify Your Email Address — AlgoViz', html });
  }

  // ── Forgot Password Email ───────────────────────────────────────────
  async sendForgotPasswordEmail(user, token) {
    const url = `${config.clientUrl}/reset-password?token=${token}&email=${user.email}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ea580c;">Reset Your Password</h2>
        <p>We received a request to reset your password for your AlgoViz account.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${url}" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">Or copy and paste this link in your browser: <br/><a href="${url}">${url}</a></p>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">If you did not request a password reset, please secure your account.</p>
      </div>
    `;
    return this.sendMail({ to: user.email, subject: 'Reset Your Password — AlgoViz', html });
  }

  // ── Security Alert (Login / Suspicious Device) ───────────────────────
  async sendLoginAlert(user, session) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #475569;">New Login Detected</h2>
        <p>Hi ${user.name}, we detected a new login to your AlgoViz account.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Device:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${session.os} / ${session.browser} (${session.deviceType})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">IP Address:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${session.ipAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Time:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${new Date().toUTCString()}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #dc2626; font-weight: bold;">If this wasn't you, reset your password and terminate all active sessions immediately.</p>
      </div>
    `;
    return this.sendMail({ to: user.email, subject: 'Security Alert: New Login — AlgoViz', html });
  }

  // ── Account Lockout Alert ──────────────────────────────────────────
  async sendLockoutAlert(user) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #dc2626;">Account Temporarily Locked</h2>
        <p>Hi ${user.name},</p>
        <p>Your account has been temporarily locked due to multiple consecutive failed login attempts.</p>
        <p>To secure your account, the lockout will remain active for 15 minutes. You can reset your password immediately if you forgot it:</p>
        <a href="${config.clientUrl}/forgot-password" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
      </div>
    `;
    return this.sendMail({ to: user.email, subject: 'Security Alert: Account Locked — AlgoViz', html });
  }
}

export default new EmailService();
