import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, 'server-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const emailConfigPath = path.join(dataDir, 'email-config.json');
const sentEmailsLogPath = path.join(dataDir, 'sent-emails.json');

/**
 * Read email configuration from environment or persisted file
 */
export const getEmailConfig = () => {
  let fileConfig = {};
  try {
    if (fs.existsSync(emailConfigPath)) {
      fileConfig = JSON.parse(fs.readFileSync(emailConfigPath, 'utf8'));
    }
  } catch (err) {
    console.warn('[EmailConfig] Failed reading email-config.json:', err.message);
  }

  const user = process.env.GMAIL_USER || process.env.SMTP_USER || fileConfig.user || '';
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || fileConfig.pass || '';
  const storeName = process.env.STORE_NAME || fileConfig.storeName || 'LEOVRA CLOTHES';
  const supportEmail = process.env.SUPPORT_EMAIL || fileConfig.supportEmail || 'leovracloth@gmail.com';
  const supportPhone = process.env.SUPPORT_PHONE || fileConfig.supportPhone || '+91 79799 68347';

  return {
    user: user.trim(),
    pass: pass.trim(),
    isConfigured: Boolean(user && pass),
    storeName,
    supportEmail,
    supportPhone
  };
};

/**
 * Save email configuration to file
 */
export const saveEmailConfig = (updates = {}) => {
  try {
    let current = {};
    if (fs.existsSync(emailConfigPath)) {
      current = JSON.parse(fs.readFileSync(emailConfigPath, 'utf8'));
    }
    const merged = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(emailConfigPath, JSON.stringify(merged, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[EmailConfig] Failed saving email-config.json:', err);
    return false;
  }
};

/**
 * Log sent emails for audit and development preview
 */
const logSentEmail = (entry) => {
  try {
    let list = [];
    if (fs.existsSync(sentEmailsLogPath)) {
      list = JSON.parse(fs.readFileSync(sentEmailsLogPath, 'utf8'));
    }
    list.unshift({
      id: 'EML-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    });
    // Keep last 100 emails in log
    if (list.length > 100) list = list.slice(0, 100);
    fs.writeFileSync(sentEmailsLogPath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('[EmailLog] Failed writing sent-emails.json:', err.message);
  }
};

/**
 * Generate a responsive, high-end HTML Tax Invoice & Order Notification
 */
export const generateOrderInvoiceHtml = (order) => {
  const cfg = getEmailConfig();
  const customer = order.customer || {};
  const customerName = customer.fullName || order.customerName || 'Valued Customer';
  const customerEmail = customer.email || order.customerEmail || '';
  const customerPhone = customer.phone || order.customerPhone || '';
  const customerAddress = customer.address || order.customerAddress || '';
  const customerCity = customer.city || order.customerCity || '';
  const customerPincode = customer.pincode || order.customerPincode || '';

  const orderNumber = order.orderNumber || order.id || 'ORD-0000';
  const invoiceNumber = order.invoiceNumber || `INV-${orderNumber}`;
  const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const paymentMode = (order.paymentMethod === 'upi' || order.paymentMethod?.toLowerCase().includes('upi'))
    ? 'Instant UPI QR (7979968347@slc)'
    : 'Cash on Delivery (COD)';

  const paymentStatus = order.paymentStatus === 'collected' || order.paymentStatus === 'verified'
    ? 'Payment Collected'
    : (order.paymentMethod === 'upi' ? 'UPI Verification Pending' : 'Payable on Delivery');

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || order.totalAmount || 0);
  const discount = Number(order.discount || 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const totalAmount = Number(order.totalAmount || (subtotal - discount + deliveryCharge));

  const itemsHtml = items.map((item, idx) => {
    const title = item.title || item.product?.title || item.name || 'Apparel Item';
    const sku = item.sku || (item.product && item.product.sku) || '';
    const size = item.size || item.selectedSize || 'Standard';
    const color = item.color || item.selectedColor || 'Standard';
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = price * qty;
    const imgUrl = item.image || (item.product && item.product.image) || '';

    return `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 14px 10px; vertical-align: middle;">
          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
            <tr>
              ${imgUrl ? `
                <td style="width: 54px; vertical-align: top; padding-right: 12px;">
                  <img src="${imgUrl}" alt="${title}" width="50" height="60" style="object-fit: cover; border-radius: 4px; display: block; border: 1px solid #eaeaea;" />
                </td>
              ` : ''}
              <td style="vertical-align: middle;">
                <div style="font-weight: 700; color: #121212; font-size: 13px; line-height: 1.3;">${title}</div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">
                  Size: <strong style="color: #374151;">${size}</strong> &bull; Color: <strong style="color: #374151;">${color}</strong>
                </div>
                ${sku ? `<div style="font-size: 10px; color: #9ca3af; font-family: monospace; margin-top: 2px;">SKU: ${sku}</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 14px 10px; text-align: center; vertical-align: middle; font-weight: 600; color: #1f2937; font-size: 13px;">
          ${qty}
        </td>
        <td style="padding: 14px 10px; text-align: right; vertical-align: middle; color: #4b5563; font-size: 13px;">
          &#8377;${price.toLocaleString('en-IN')}
        </td>
        <td style="padding: 14px 10px; text-align: right; vertical-align: middle; font-weight: 700; color: #111827; font-size: 13px;">
          &#8377;${lineTotal.toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f7; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          
          <!-- Top Brand Header Bar -->
          <tr>
            <td style="background-color: #121212; padding: 26px 30px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                      LEOVRA CLOTHES
                    </div>
                    <div style="font-size: 10px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; margin-top: 4px; font-weight: 600;">
                      Modern Streetwear &bull; Timeless Luxury
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%); padding: 26px 30px; border-bottom: 1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #a7f3d0; margin-bottom: 10px;">
                      &#10003; Order Confirmed &amp; Invoiced
                    </div>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">
                      Thank you for your order, ${customerName}!
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">
                      We have received your order. Below is your official Tax Invoice and complete order summary.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Metadata Cards -->
          <tr>
            <td style="padding: 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb; padding: 14px;">
                <tr>
                  <td style="padding: 6px 12px; vertical-align: top; width: 50%;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700;">Order Reference</div>
                    <div style="font-size: 14px; font-weight: 800; color: #111827; font-family: monospace; margin-top: 2px;">${orderNumber}</div>
                    
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700; margin-top: 10px;">Invoice Number</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151; font-family: monospace; margin-top: 1px;">${invoiceNumber}</div>
                  </td>
                  <td style="padding: 6px 12px; vertical-align: top; width: 50%; text-align: right;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700;">Order Date</div>
                    <div style="font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px;">${orderDate}</div>

                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700; margin-top: 10px;">Payment Mode</div>
                    <div style="font-size: 12px; font-weight: 700; color: #047857; margin-top: 1px;">${paymentMode}</div>
                    <div style="font-size: 11px; color: #6b7280;">(${paymentStatus})</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 10px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #111827;">
                    <th align="left" style="padding: 10px 10px 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #374151; font-weight: 700;">Item</th>
                    <th align="center" style="padding: 10px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #374151; font-weight: 700;">Qty</th>
                    <th align="right" style="padding: 10px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #374151; font-weight: 700;">Price</th>
                    <th align="right" style="padding: 10px 0 10px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #374151; font-weight: 700;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown -->
          <tr>
            <td style="padding: 10px 30px 24px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 20px;">
                    <div style="background-color: #f9fafb; border-radius: 6px; padding: 14px; border: 1px dashed #d1d5db;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4b5563; margin-bottom: 4px;">Delivery Address</div>
                      <div style="font-size: 13px; font-weight: 700; color: #111827;">${customerName}</div>
                      <div style="font-size: 12px; color: #4b5563; margin-top: 3px; line-height: 1.4;">
                        ${customerAddress ? `${customerAddress}<br>` : ''}
                        ${customerCity ? `${customerCity}` : ''} ${customerPincode ? `- ${customerPincode}` : ''}
                      </div>
                      ${customerPhone ? `<div style="font-size: 12px; color: #4b5563; margin-top: 4px;">Phone: <strong>${customerPhone}</strong></div>` : ''}
                      ${customerEmail ? `<div style="font-size: 12px; color: #4b5563;">Email: <strong>${customerEmail}</strong></div>` : ''}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align: top;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Subtotal:</td>
                        <td align="right" style="padding: 6px 0; color: #374151; font-weight: 600;">&#8377;${subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                      ${discount > 0 ? `
                        <tr>
                          <td style="padding: 6px 0; color: #047857;">Discount (${order.couponCode || 'Promo'}):</td>
                          <td align="right" style="padding: 6px 0; color: #047857; font-weight: 700;">-&#8377;${discount.toLocaleString('en-IN')}</td>
                        </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Nationwide Delivery:</td>
                        <td align="right" style="padding: 6px 0; color: #374151; font-weight: 600;">
                          ${deliveryCharge === 0 ? '<span style="color: #059669; font-weight: 700;">FREE</span>' : `&#8377;${deliveryCharge}`}
                        </td>
                      </tr>
                      <tr style="border-top: 2px solid #111827;">
                        <td style="padding: 12px 0; font-size: 15px; font-weight: 800; color: #111827;">Grand Total:</td>
                        <td align="right" style="padding: 12px 0; font-size: 16px; font-weight: 900; color: #111827;">&#8377;${totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colspan="2" align="right" style="font-size: 10px; color: #9ca3af;">(Inclusive of all taxes &amp; GST)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security & 7-Day Guarantee Assurance -->
          <tr>
            <td style="background-color: #fafaf9; padding: 18px 30px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #57534e;">
                <tr>
                  <td width="33%" align="center" style="padding: 4px;">
                    <div style="font-weight: 700; color: #1c1917;">&#128230; 7-Day Easy Returns</div>
                    <div style="font-size: 11px; color: #78716c;">Hassle-free replacement</div>
                  </td>
                  <td width="33%" align="center" style="padding: 4px; border-left: 1px solid #e7e5e4; border-right: 1px solid #e7e5e4;">
                    <div style="font-weight: 700; color: #1c1917;">&#9889; Express Shipping</div>
                    <div style="font-size: 11px; color: #78716c;">Dispatches in 24-48 hrs</div>
                  </td>
                  <td width="33%" align="center" style="padding: 4px;">
                    <div style="font-weight: 700; color: #1c1917;">&#10004; 100% Authentic</div>
                    <div style="font-size: 11px; color: #78716c;">Quality Handcrafted</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Support Information -->
          <tr>
            <td style="padding: 24px 30px; text-align: center; background-color: #ffffff;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Need help with your order? Our support team is ready to assist you:
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #111827;">
                Helpline / WhatsApp: <a href="tel:+917979968347" style="color: #111827; text-decoration: none;">+91 79799 68347</a> &bull; Email: <a href="mailto:${cfg.supportEmail}" style="color: #111827; text-decoration: none;">${cfg.supportEmail}</a>
              </p>
              <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af;">
                LEOVRA CLOTHES &bull; Tax Invoice #${invoiceNumber} &bull; GSTIN: 07AAACL1234F1Z5<br>
                This is an automated computer-generated tax invoice sent to your registered Gmail address (${customerEmail || 'Customer'}).
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send Order Confirmation & Tax Invoice Email to Customer's Gmail
 */
export const sendOrderConfirmationEmail = async (order, targetEmail = null) => {
  const cfg = getEmailConfig();
  const customer = order.customer || {};
  const recipient = (targetEmail || customer.email || order.customerEmail || '').trim();

  if (!recipient || !recipient.includes('@')) {
    console.warn(`[Email] Skipping email dispatch: No valid recipient email provided for order #${order.orderNumber || order.id}`);
    return {
      success: false,
      error: 'No valid recipient email address provided for this order.'
    };
  }

  const orderNum = order.orderNumber || order.id;
  const invoiceNum = order.invoiceNumber || `INV-${orderNum}`;
  const subject = `Order Confirmed: #${orderNum} - ${cfg.storeName} Tax Invoice & Details`;
  const htmlContent = generateOrderInvoiceHtml(order);

  // Plain text fallback
  const textContent = `
Thank you for your order with ${cfg.storeName}!

Order Number: ${orderNum}
Invoice Number: ${invoiceNum}
Date: ${new Date(order.orderDate || Date.now()).toLocaleDateString('en-IN')}
Total Amount: Rs. ${order.totalAmount}
Payment Mode: ${order.paymentMethod}

Customer: ${customer.fullName || order.customerName || 'Customer'}
Phone: ${customer.phone || order.customerPhone || ''}
Address: ${customer.address || order.customerAddress || ''}, ${customer.city || order.customerCity || ''}

For full tax invoice and items breakdown, view this email in an HTML-capable email viewer or login at our store.
Support: ${cfg.supportPhone} | ${cfg.supportEmail}
  `.trim();

  // If live Gmail SMTP credentials are configured:
  if (cfg.isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cfg.user,
          pass: cfg.pass
        }
      });

      const mailOptions = {
        from: `"${cfg.storeName}" <${cfg.user}>`,
        to: recipient,
        bcc: cfg.user, // Send a copy to the store owner's Gmail as well!
        subject,
        text: textContent,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent order confirmation & invoice to ${recipient} (Message ID: ${info.messageId})`);

      logSentEmail({
        recipient,
        orderNumber: orderNum,
        subject,
        status: 'delivered',
        messageId: info.messageId,
        live: true
      });

      return {
        success: true,
        delivered: true,
        recipient,
        orderNumber: orderNum,
        messageId: info.messageId,
        mode: 'live_smtp'
      };
    } catch (err) {
      console.error(`[Email Error] Failed delivering live email to ${recipient}:`, err.message);

      logSentEmail({
        recipient,
        orderNumber: orderNum,
        subject,
        status: 'failed',
        error: err.message,
        live: true
      });

      return {
        success: false,
        delivered: false,
        recipient,
        error: err.message,
        hint: 'Check Gmail App Password in .env (GMAIL_APP_PASSWORD) or Admin Settings.'
      };
    }
  } else {
    // Mode: Ready for credentials / Local preview logging
    console.log(`[Email Notice] Real-time email simulation: Order confirmation & tax invoice logged for ${recipient} (Order #${orderNum}).`);
    console.log(`[Email Notice] To send live emails to ${recipient}, configure GMAIL_USER and GMAIL_APP_PASSWORD in .env or Admin Settings.`);

    logSentEmail({
      recipient,
      orderNumber: orderNum,
      subject,
      status: 'simulated_logged',
      live: false,
      note: 'GMAIL_APP_PASSWORD not yet configured in environment. Logged preview to sent-emails.json.'
    });

    return {
      success: true,
      delivered: false,
      recipient,
      orderNumber: orderNum,
      mode: 'simulated_logged',
      message: `Invoice generated for ${recipient}. To send live emails directly from Gmail, add GMAIL_APP_PASSWORD to .env or Admin Settings.`
    };
  }
};

/**
 * Send a verification/test email to confirm SMTP is working
 */
export const sendTestEmail = async (targetEmail) => {
  const cfg = getEmailConfig();
  if (!targetEmail || !targetEmail.includes('@')) {
    throw new Error('Valid email address required');
  }

  if (!cfg.isConfigured) {
    return {
      success: false,
      isConfigured: false,
      message: 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD.'
    };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: cfg.user,
      pass: cfg.pass
    }
  });

  const testMail = {
    from: `"${cfg.storeName} Test" <${cfg.user}>`,
    to: targetEmail,
    subject: `Test Verification Email - ${cfg.storeName}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #121212; margin-top: 0;">LEOVRA CLOTHES Email System Active</h2>
        <p style="color: #4b5563;">This is a test notification confirming that Gmail SMTP integration is working 100%.</p>
        <p style="color: #059669; font-weight: bold;">&#10003; Order notifications and tax invoices will be dispatched to customer Gmail addresses automatically upon checkout.</p>
        <div style="font-size: 11px; color: #9ca3af; margin-top: 15px;">Sent at: ${new Date().toISOString()}</div>
      </div>
    `
  };

  const info = await transporter.sendMail(testMail);
  return {
    success: true,
    isConfigured: true,
    messageId: info.messageId,
    recipient: targetEmail
  };
};
