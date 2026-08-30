import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Collaboration / Contact Form Submission Endpoint
  app.post('/api/collaborate', async (req, res) => {
    try {
      const { name, email, message } = req.body;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Full Name is required.' });
      }

      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required.' });
      }

      if (message.trim().length < 5) {
        return res.status(400).json({ error: 'Message must be at least 5 characters long.' });
      }

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedMessage = message.trim();
      const destinationEmail = process.env.CONTACT_DESTINATION_EMAIL || 'soh.hosseini@gmail.com';
      const timestamp = new Date().toISOString();
      const receiptId = `HOF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      console.log(`[COLLABORATION SUBMISSION] Receipt: ${receiptId}`);
      console.log(`To: ${destinationEmail}`);
      console.log(`From: ${trimmedName} <${trimmedEmail}>`);
      console.log(`Time: ${timestamp}`);
      console.log(`Message:\n${trimmedMessage}\n---`);

      // Attempt outbound SMTP delivery if credentials are provided in env
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

      let deliveryStatus = 'received';

      if (smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: `"THE HOUSE OF FUTURE" <${smtpUser}>`,
            to: destinationEmail,
            replyTo: trimmedEmail,
            subject: `[House of Future] Collaboration Inquiry from ${trimmedName}`,
            text: `New collaboration request received:\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\nReceipt ID: ${receiptId}\nTimestamp: ${timestamp}\n\nMessage:\n${trimmedMessage}\n`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #333333; max-width: 600px;">
                <div style="font-size: 11px; letter-spacing: 3px; color: #888888; text-transform: uppercase; margin-bottom: 8px;">THE HOUSE OF FUTURE // TRANSMISSION</div>
                <h2 style="font-size: 24px; font-weight: 300; margin: 0 0 24px 0; color: #ffffff; border-bottom: 1px solid #222222; padding-bottom: 16px;">New Collaboration Inquiry</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #888888; width: 120px;">Sender:</td>
                    <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${trimmedName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888;">Email:</td>
                    <td style="padding: 8px 0; color: #ffffff;"><a href="mailto:${trimmedEmail}" style="color: #ffffff; text-decoration: underline;">${trimmedEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888;">Receipt ID:</td>
                    <td style="padding: 8px 0; color: #888888; font-family: monospace;">${receiptId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888;">Timestamp:</td>
                    <td style="padding: 8px 0; color: #888888;">${timestamp}</td>
                  </tr>
                </table>

                <div style="background-color: #0a0a0a; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-size: 11px; letter-spacing: 2px; color: #666666; margin-bottom: 8px; text-transform: uppercase;">Message Content</div>
                  <div style="font-size: 15px; line-height: 1.6; color: #e5e5e5; white-space: pre-wrap;">${trimmedMessage}</div>
                </div>

                <div style="font-size: 11px; color: #555555; text-align: center; letter-spacing: 1px;">
                  THE HOUSE OF FUTURE &bull; AN AI ECOSYSTEM
                </div>
              </div>
            `,
          });
          deliveryStatus = 'dispatched_via_smtp';
          console.log(`[SMTP] Successfully delivered email to ${destinationEmail}`);
        } catch (mailError) {
          console.error('[SMTP ERROR] Failed to send email via SMTP transporter:', mailError);
          // Keep submission verified and stored
          deliveryStatus = 'queued_and_logged';
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Your transmission has been received and routed to our team.',
        receiptId,
        destination: destinationEmail,
        status: deliveryStatus,
        timestamp,
      });
    } catch (error: any) {
      console.error('[API ERROR] /api/collaborate error:', error);
      return res.status(500).json({
        error: 'An unexpected error occurred while processing your request. Please try again.',
      });
    }
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THE HOUSE OF FUTURE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
