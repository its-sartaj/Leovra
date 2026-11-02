import { Order, StoreSettings, OrderCustomer } from '../types';
import { storeService } from './storeService';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ============================================================
// LEOVRA CLOTHES - 1-Click Gmail Auto-Invoice Webhook
// Deploy this script in Google Apps Script (script.google.com)
// to automatically send Order Confirmations & Tax Invoices
// directly to customers' Gmail from your own store Gmail!
// ============================================================

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    
    var recipient = data.to || data.email || data.recipient;
    var subject = data.subject || ("LEOVRA Order Confirmed: #" + (data.orderNumber || ""));
    var htmlBody = data.htmlBody || data.body || "";
    var storeName = data.storeName || "LEOVRA CLOTHES";
    
    if (!recipient) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing recipient email address."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Send the email directly using your Google Account's Gmail
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody,
      name: storeName
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Order confirmation & invoice delivered to " + recipient,
      recipient: recipient,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "LEOVRA CLOTHES Gmail Invoice Dispatcher",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Generate a responsive, luxury HTML Tax Invoice for printing, emailing, or previewing
 */
export const generateOrderInvoiceHtml = (order: Order, customSettings?: StoreSettings): string => {
  const settings = customSettings || storeService.getSettings();
  const customer: Partial<OrderCustomer> = order.customer || {};
  const customerName = customer.fullName || order.customerName || 'Valued Customer';
  const customerEmail = customer.email || order.customerEmail || '';
  const customerPhone = customer.phone || order.customerPhone || '';
  const customerAddress = customer.address || order.customerAddress || '';
  const customerCity = customer.city || order.customerCity || '';
  const customerPincode = customer.pincode || (order as any).customerPincode || '';

  const orderNumber = order.orderNumber || order.id || 'ORD-0000';
  const invoiceNumber = order.invoiceNumber || `INV-${orderNumber}`;
  const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const paymentMode = (order.paymentMethod === 'upi' || order.paymentMethod?.toLowerCase().includes('upi'))
    ? `Instant UPI QR (${settings.upiId || '7979968347@slc'})`
    : 'Cash on Delivery (COD)';

  const paymentStatus = order.paymentStatus === 'collected' || order.paymentStatus === 'verified'
    ? 'Payment Collected'
    : (order.paymentMethod === 'upi' ? 'UPI Verification Pending' : 'Payable on Delivery');

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || order.totalAmount || 0);
  const discount = Number(order.discount || 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const totalAmount = Number(order.totalAmount || (subtotal - discount + deliveryCharge));

  const itemsHtml = items.map((item) => {
    const title = item.title || item.product?.title || (item as any).name || 'Apparel Item';
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
        <!-- Main Invoice Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          
          <!-- Top Brand Header Bar -->
          <tr>
            <td style="background-color: #121212; padding: 26px 30px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                      ${settings.brandName || 'LEOVRA CLOTHES'}
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
                  <tr style="border-bottom: 2px solid #e5e7eb; background-color: #f9fafb;">
                    <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; font-weight: 700;">Item Description</th>
                    <th style="padding: 10px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; font-weight: 700; width: 50px;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; font-weight: 700; width: 80px;">Rate</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; font-weight: 700; width: 90px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Price Calculation & Delivery Details -->
          <tr>
            <td style="padding: 10px 30px 24px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Shipping Address Column -->
                  <td style="vertical-align: top; width: 55%; padding-right: 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; font-weight: 700; margin-bottom: 6px;">
                      Shipping Address
                    </div>
                    <div style="background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb; padding: 12px; font-size: 12px; line-height: 1.5; color: #374151;">
                      <div style="font-weight: 700; color: #111827;">${customerName}</div>
                      ${customerPhone ? `<div>Phone: <strong>${customerPhone}</strong></div>` : ''}
                      ${customerEmail ? `<div>Email: <strong>${customerEmail}</strong></div>` : ''}
                      <div style="margin-top: 4px;">${customerAddress}</div>
                      <div>${customerCity}${customerPincode ? ` - ${customerPincode}` : ''}</div>
                    </div>

                    ${order.trackingId ? `
                      <div style="margin-top: 10px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; font-size: 11px; color: #1e40af;">
                        <span style="font-weight: 700;">Courier Tracking:</span> ${order.courierName || 'Express Courier'} &bull; 
                        <span style="font-family: monospace; font-weight: 700;">${order.trackingId}</span>
                      </div>
                    ` : ''}
                  </td>

                  <!-- Price Breakdown Column -->
                  <td style="vertical-align: top; width: 45%;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.8;">
                      <tr>
                        <td style="color: #6b7280;">Subtotal:</td>
                        <td style="text-align: right; color: #111827; font-weight: 600;">&#8377;${subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                      ${discount > 0 ? `
                        <tr>
                          <td style="color: #059669;">Coupon Discount:</td>
                          <td style="text-align: right; color: #059669; font-weight: 600;">-&#8377;${discount.toLocaleString('en-IN')}</td>
                        </tr>
                      ` : ''}
                      <tr>
                        <td style="color: #6b7280;">Delivery Fee:</td>
                        <td style="text-align: right; color: #111827; font-weight: 600;">
                          ${deliveryCharge === 0 ? '<span style="color: #059669; font-weight: 700;">FREE</span>' : `&#8377;${deliveryCharge}`}
                        </td>
                      </tr>
                      <tr style="border-top: 2px solid #111827;">
                        <td style="padding-top: 8px; font-size: 15px; font-weight: 800; color: #111827;">Final Total:</td>
                        <td style="padding-top: 8px; text-align: right; font-size: 17px; font-weight: 900; color: #111827;">
                          &#8377;${totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="text-align: right; font-size: 10px; color: #9ca3af; padding-top: 2px;">
                          (Inclusive of all applicable GST)
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Return Policy & Help Section -->
          <tr>
            <td style="background-color: #fafafa; padding: 18px 30px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #6b7280; line-height: 1.6;">
              <div style="font-weight: 700; color: #374151; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                7-Day Hassle-Free Returns &amp; Exchange Guarantee
              </div>
              <div>
                Items can be returned within 7 days of package delivery. Merchandise must be unwashed, unworn, and retain all original brand tags.
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                <span>Need support? Call/WhatsApp: <strong style="color: #111827;">${settings.supportPhone || '+91 79799 68347'}</strong></span>
                <span style="float: right;">Email: <strong style="color: #111827;">${settings.supportEmail || 'support@leovraclothes.com'}</strong></span>
              </div>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background-color: #121212; padding: 14px 30px; text-align: center; font-size: 10px; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">
              &copy; ${new Date().getFullYear()} ${settings.brandName || 'LEOVRA CLOTHES'}. All Rights Reserved.
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
 * Supports:
 * 1. Google Apps Script Web App (Direct from GitHub Pages or client)
 * 2. Node.js backend (/api/send-order-email)
 */
export const sendOrderInvoiceEmail = async (
  order: Order,
  customRecipient?: string
): Promise<{ success: boolean; message: string; method?: string; error?: string }> => {
  const customer: Partial<OrderCustomer> = order.customer || {};
  const recipient = (customRecipient || order.customerEmail || customer.email || '').trim();

  if (!recipient || !recipient.includes('@')) {
    console.warn('[EmailService] Skipped: No valid recipient email address.');
    return {
      success: false,
      message: 'No recipient email address provided.',
      error: 'Please enter a valid Gmail / Email address.'
    };
  }

  const settings = storeService.getSettings();
  const webhookUrl = settings.emailWebhookUrl || localStorage.getItem('lc_email_webhook_url') || '';
  const backendApiUrl = settings.backendApiUrl || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '' : '');
  const orderNum = order.orderNumber || order.id || 'LC-ORDER';
  const subject = `Order Confirmed: #${orderNum} - ${settings.brandName || 'LEOVRA CLOTHES'} Tax Invoice`;
  const htmlBody = generateOrderInvoiceHtml(order, settings);

  // ============================================================
  // METHOD 1: Google Apps Script Web App (Works directly on GitHub Pages!)
  // ============================================================
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const payload = {
        to: recipient,
        email: recipient,
        subject: subject,
        orderNumber: orderNum,
        customerName: customer.fullName || order.customerName || 'Customer',
        totalAmount: order.totalAmount,
        storeName: settings.brandName || 'LEOVRA CLOTHES',
        htmlBody: htmlBody
      };

      // In browser, use mode: 'no-cors' so cross-domain 302 redirect never throws Failed to fetch
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return {
        success: true,
        message: `Official Tax Invoice & confirmation successfully emailed to ${recipient}!`,
        method: 'google_apps_script'
      };
    } catch (err: any) {
      console.warn('[EmailService] Google Apps Script webhook fetch note:', err.message);
    }
  }

  // ============================================================
  // METHOD 2: Node.js Backend API (/api/send-order-email)
  // ============================================================
  try {
    const endpoint = backendApiUrl ? `${backendApiUrl.replace(/\/+$/, '')}/api/send-order-email` : '/api/send-order-email';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, email: recipient })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          message: `Tax invoice dispatched to ${recipient} via store server.`,
          method: 'node_smtp'
        };
      }
    }
  } catch (err: any) {
    console.warn('[EmailService] Local backend API dispatch note:', err.message);
  }

  // ============================================================
  // METHOD 3: Fallback Notice
  // ============================================================
  return {
    success: false,
    message: `Email webhook not yet configured. You can configure your Gmail Webhook in Admin Settings, or click "View Tax Invoice" to save/print.`,
    error: 'Webhook URL not set'
  };
};

/**
 * Send a test email to verify Gmail Webhook or Node Server
 */
export const sendTestEmail = async (
  targetEmail: string,
  customWebhookUrl?: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  const cleanTarget = targetEmail.trim();
  if (!cleanTarget || !cleanTarget.includes('@')) {
    return { success: false, message: 'Please provide a valid Gmail address.', error: 'Invalid email' };
  }

  const settings = storeService.getSettings();
  const webhook = (customWebhookUrl || settings.emailWebhookUrl || localStorage.getItem('lc_email_webhook_url') || '').trim();

  // Test via Google Apps Script Webhook
  if (webhook && webhook.startsWith('http')) {
    try {
      const testHtml = `
        <div style="font-family: sans-serif; padding: 24px; max-width: 500px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #121212; margin-top: 0;">✓ LEOVRA CLOTHES Gmail Test Verified</h2>
          <p style="color: #4b5563; font-size: 14px;">
            Your Gmail Auto-Invoice notification system is successfully configured and active!
          </p>
          <div style="padding: 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; color: #065f46; font-size: 13px; font-weight: 600;">
            Every customer who signs in with Gmail and completes an order will receive their Tax Invoice and dispatch updates right in their inbox.
          </div>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 16px;">
            Sent on: ${new Date().toLocaleString('en-IN')} &bull; LEOVRA CLOTHES
          </p>
        </div>
      `;

      await fetch(webhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          to: cleanTarget,
          email: cleanTarget,
          subject: '✓ LEOVRA CLOTHES - Test Notification Verified',
          storeName: settings.brandName || 'LEOVRA CLOTHES',
          htmlBody: testHtml
        })
      });

      return {
        success: true,
        message: `Verification test email dispatched to ${cleanTarget}! Check your Gmail inbox/spam.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to dispatch via webhook: ${err.message}`,
        error: err.message
      };
    }
  }

  // Test via Node Backend API
  try {
    const res = await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanTarget })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success,
        message: data.message || `Test email dispatched to ${cleanTarget}`
      };
    }
  } catch (err: any) {
    // Both failed
  }

  return {
    success: false,
    message: 'No Gmail Webhook or Node Server active. Please paste your Google Apps Script Web App URL above and click Save!',
    error: 'No active email provider'
  };
};

/**
 * Open high-resolution printable Tax Invoice window (Print or Save as PDF)
 */
export const openPrintInvoice = (order: Order, customSettings?: StoreSettings): void => {
  if (typeof window === 'undefined') return;
  const html = generateOrderInvoiceHtml(order, customSettings);
  const printWin = window.open('', '_blank', 'width=800,height=900,menubar=no,status=no,titlebar=no');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 400);
  }
};

/**
 * Open WhatsApp with pre-filled order confirmation & breakdown
 */
export const openWhatsAppInvoice = (order: Order, customSettings?: StoreSettings): void => {
  if (typeof window === 'undefined') return;
  const settings = customSettings || storeService.getSettings();
  const customer: Partial<OrderCustomer> = order.customer || {};
  const orderNum = order.orderNumber || order.id;
  const phone = (customer.phone || order.customerPhone || settings.supportPhone || '7979968347').replace(/\D/g, '').slice(-10);

  const itemsList = (order.items || [])
    .map(i => `• ${i.title} (${i.size || 'Free Size'}) x ${i.quantity} = Rs. ${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const text = `🛍️ *LEOVRA CLOTHES - Order Confirmation*

*Order Number:* ${orderNum}
*Invoice:* ${order.invoiceNumber || 'INV-' + orderNum}
*Customer:* ${customer.fullName || order.customerName || 'Valued Customer'}
*Date:* ${new Date(order.orderDate || Date.now()).toLocaleDateString('en-IN')}

*Items Ordered:*
${itemsList}

*Subtotal:* Rs. ${order.subtotal || order.totalAmount}
*Delivery:* ${order.deliveryCharge === 0 ? 'FREE' : 'Rs. ' + order.deliveryCharge}
*Total Amount:* Rs. ${order.totalAmount} (${order.paymentMethod || 'Cash on Delivery'})

*Shipping Address:*
${customer.address || order.customerAddress || ''}, ${customer.city || order.customerCity || ''}

*Track your order:*
https://its-sartaj.github.io/Leovra/

_Thank you for choosing LEOVRA CLOTHES!_`;

  const url = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

/**
 * Open default Email app with pre-filled Tax Invoice
 */
export const openMailtoInvoice = (order: Order, targetEmail?: string): void => {
  if (typeof window === 'undefined') return;
  const customer: Partial<OrderCustomer> = order.customer || {};
  const recipient = targetEmail || order.customerEmail || customer.email || '';
  const orderNum = order.orderNumber || order.id;
  const subject = `Order Confirmed: #${orderNum} - LEOVRA CLOTHES Tax Invoice`;
  const body = `Dear ${customer.fullName || 'Customer'},\n\nThank you for your order with LEOVRA CLOTHES!\n\nOrder Number: ${orderNum}\nInvoice Number: ${order.invoiceNumber || 'INV-' + orderNum}\nTotal Amount: Rs. ${order.totalAmount}\nPayment Method: ${order.paymentMethod}\n\nTrack your order anytime at: https://its-sartaj.github.io/Leovra/\n\nWarm regards,\nLEOVRA CLOTHES Support\n+91 79799 68347`;

  window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
