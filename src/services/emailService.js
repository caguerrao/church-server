const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendPasswordResetEmail(email, nombre, resetUrl, token) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #2563EB; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Has solicitado restablecer tu contraseña para la <strong>Iglesia App</strong>.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}?token=${token}" class="button">Restablecer Contraseña</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expira en <strong>1 hora</strong></li>
                <li>Solo puede usarse una vez</li>
                <li>Si no solicitaste esto, ignora este email</li>
              </ul>
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace:</p>
            <code style="background: #E5E7EB; padding: 10px; border-radius: 4px; word-break: break-all; display: block;">
              ${resetUrl}?token=${token}
            </code>
          </div>
          <div class="footer">
            <p>Este es un email automático, no respondas a esta dirección.</p>
            <p>© ${new Date().getFullYear()} Iglesia App. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Iglesia App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Recuperación de Contraseña - Iglesia App',
      html: htmlContent,
      text: `Hola ${nombre}, has solicitado restablecer tu contraseña. Usa este enlace: ${resetUrl}?token=${token} (expira en 1 hora)`
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordChangedConfirmation(email, nombre) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { background: #D1FAE5; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">
            <h2>✅ Contraseña Actualizada</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p>Si no realizaste este cambio, contacta al administrador inmediatamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Iglesia App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Contraseña Actualizada - Iglesia App',
      html: htmlContent
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();