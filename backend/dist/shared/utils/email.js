"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const config_1 = require("../../config");
const logger_1 = require("./logger");
if (config_1.config.SENDGRID_API_KEY) {
    mail_1.default.setApiKey(config_1.config.SENDGRID_API_KEY);
}
// ─────────────────────────────────────────────────────────
// Email templates
// ─────────────────────────────────────────────────────────
const templates = {
    contactConfirmation: (name) => ({
        subject: 'Got your message! — ARHDAY Photography',
        html: `
      <div style="background:#0a0a0a;color:#fff;padding:48px 32px;font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;border-radius:12px;">
        <div style="font-size:12px;letter-spacing:0.18em;color:#E84C0D;margin-bottom:32px;">ARHDAY</div>
        <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400;color:#fff;margin:0 0 16px;">Hey ${name}, I got your message.</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 24px;">
          Thanks for reaching out. I'll review the details and get back to you within 24 hours with availability and next steps.
        </p>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 32px;">
          In the meantime, feel free to browse the portfolio at <a href="${config_1.config.FRONTEND_URL}/work" style="color:#E84C0D;text-decoration:none;">arhday.com/work</a>.
        </p>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;color:rgba(255,255,255,0.3);font-size:12px;">
          Adegheosa · Lagos, Nigeria · @_arhday_photography
        </div>
      </div>
    `,
    }),
    adminNewInquiry: (data) => ({
        subject: `📬 New inquiry from ${data.name}`,
        html: `
      <div style="background:#0a0a0a;color:#fff;padding:32px;font-family:'Helvetica Neue',sans-serif;max-width:560px;">
        <h2 style="color:#E84C0D;margin:0 0 24px;">New Contact Inquiry</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:rgba(255,255,255,0.4);padding:8px 0;font-size:13px;">Name</td><td style="color:#fff;font-size:13px;">${data.name}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.4);padding:8px 0;font-size:13px;">Email</td><td style="color:#E84C0D;font-size:13px;"><a href="mailto:${data.email}" style="color:#E84C0D;">${data.email}</a></td></tr>
          <tr><td style="color:rgba(255,255,255,0.4);padding:8px 0;font-size:13px;">Location</td><td style="color:#fff;font-size:13px;">${data.location ?? 'Not specified'}</td></tr>
        </table>
        <div style="background:#141414;border-radius:8px;padding:16px;margin-top:20px;">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
          <p style="color:#fff;font-size:14px;line-height:1.7;margin:0;">${data.message}</p>
        </div>
        <a href="${config_1.config.FRONTEND_URL}/admin/inquiries" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#E84C0D;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;">View in Dashboard</a>
      </div>
    `,
    }),
    subscriberWelcome: (email, unsubToken) => ({
        subject: 'You\'re in — ARHDAY Photography',
        html: `
      <div style="background:#0a0a0a;color:#fff;padding:48px 32px;font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;border-radius:12px;">
        <div style="font-size:12px;letter-spacing:0.18em;color:#E84C0D;margin-bottom:32px;">ARHDAY</div>
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#fff;margin:0 0 16px;">You're on the list.</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;">
          Expect updates on new shoots, behind-the-scenes moments, and booking availability. No spam, ever.
        </p>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;margin-top:32px;color:rgba(255,255,255,0.25);font-size:11px;">
          <a href="${config_1.config.FRONTEND_URL}/unsubscribe?token=${unsubToken}" style="color:rgba(255,255,255,0.25);">Unsubscribe</a>
        </div>
      </div>
    `,
    }),
};
async function sendEmail(options) {
    if (config_1.config.NODE_ENV === 'test') {
        logger_1.logger.debug(`[test] Email to ${options.to}: ${options.subject}`);
        return;
    }
    try {
        if (config_1.config.SENDGRID_API_KEY) {
            await mail_1.default.send({
                to: options.to,
                from: { email: config_1.config.EMAIL_FROM, name: config_1.config.EMAIL_FROM_NAME },
                subject: options.subject,
                html: options.html,
                replyTo: options.replyTo,
            });
        }
        else {
            // Fallback: log in dev when no API key is set
            logger_1.logger.debug(`📧 [email] To: ${options.to} | Subject: ${options.subject}`);
        }
        logger_1.logger.info(`Email sent to ${options.to}`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send email to ${options.to}:`, err);
        // Don't throw — email failures shouldn't crash request handlers
    }
}
// ─────────────────────────────────────────────────────────
// Public email API
// ─────────────────────────────────────────────────────────
exports.emailService = {
    async sendContactConfirmation(name, email) {
        const tmpl = templates.contactConfirmation(name);
        await sendEmail({ to: email, ...tmpl });
    },
    async sendAdminNewInquiry(data) {
        const tmpl = templates.adminNewInquiry(data);
        await sendEmail({ to: config_1.config.ADMIN_EMAIL, replyTo: data.email, ...tmpl });
    },
    async sendSubscriberWelcome(email, unsubToken) {
        const tmpl = templates.subscriberWelcome(email, unsubToken);
        await sendEmail({ to: email, ...tmpl });
    },
};
//# sourceMappingURL=email.js.map