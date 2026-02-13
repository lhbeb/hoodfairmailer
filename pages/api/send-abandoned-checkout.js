import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';
import * as cheerio from 'cheerio';

// Reuse the transporter from the shipping email
// let transporter = null;

// function getTransporter() {
//   if (!transporter) {
//     transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true, // Use SSL
//       secure: true, // Use SSL
//       auth: {
//         user: 'support@hoodfair.com',
//         pass: 'gdui faql dedk yhxg',
//       },
//     });
//   }
//   return transporter;
// }

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerName, customerEmail, productName, productLink, checkoutUrl, senderEmail } = req.body;

    // Validate required fields
    if (!customerEmail || !checkoutUrl) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail and checkoutUrl are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('=== SENDING ABANDONED CHECKOUT EMAIL ===');
    console.log('Customer Email:', customerEmail);

    let productImage = null;

    // Fetch product image if link is provided
    if (productLink) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(productLink, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; HoodfairBot/1.0;)'
          }
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        // Try to find og:image
        productImage = $('meta[property="og:image"]').attr('content');

        // Fallback to twitter:image
        if (!productImage) {
          productImage = $('meta[name="twitter:image"]').attr('content');
        }

        // Fallback to first image on page (absolute path only)
        if (!productImage) {
          const firstImg = $('img').first().attr('src');
          if (firstImg) {
            // Handle relative URLs
            if (firstImg.startsWith('http')) {
              productImage = firstImg;
            } else {
              try {
                const url = new URL(productLink);
                productImage = `${url.protocol}//${url.host}${firstImg.startsWith('/') ? '' : '/'}${firstImg}`;
              } catch (e) {
                // Ignore URL parsing errors
              }
            }
          }
        }
      } catch (error) {
        console.warn('Warning: Failed to fetch product image (continuing without it):', error.message);
        // Continue without image - this is not fatal
      }
    }

    // Get the email transporter
    // const emailTransporter = getTransporter();
    let account;
    if (senderEmail) {
      account = getAccountByUser(senderEmail);
      if (!account) {
        console.warn(`Requested sender email ${senderEmail} not found. Falling back to random account.`);
        account = getRandomAccount();
      } else {
        console.log(`Using manually selected email account: ${account.user}`);
      }
    } else {
      account = getRandomAccount();
      console.log(`Using randomly selected email account: ${account.user}`);
    }
    const emailTransporter = createTransporter(account);

    // HTML email template - Hoodfair.com Branded Design (Table-Based for iOS Support)
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Complete Your Purchase - Hoodfair.com</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #1e293b;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          @media screen and (max-width: 600px) {
            .content-cell {
              padding: 20px !important;
            }
            .header h1 {
              font-size: 24px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #1e293b;">
        
        <!-- Wrapper Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 20px 10px;">
              
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr class="header">
                  <td style="background-color: #2356A5; padding: 40px 32px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.2;">
                      someone 👀 is eyeing your ${productName || 'item'}
                    </h1>
                    <p style="color: #e0e7ff; font-size: 16px; margin: 0; line-height: 1.5; font-weight: 500;">
                      Complete your purchase before it's gone
                    </p>
                  </td>
                </tr>
                
                <!-- Content Section -->
                <tr>
                  <td class="content-cell" style="padding: 32px 24px;">
                    
                    <!-- Abandoned Item Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF4D9; border: 1px solid #FFE082; border-radius: 16px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 32px; text-align: center;">
                          <!-- Product Image or Icon -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 24px;">
                            <tr>
                              <td>
                                ${productImage ? `
                                  <img src="${productImage}" alt="${productName || 'Product'}" style="width: 200px; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: block;">
                                ` : `
                                  <div style="width: 64px; height: 64px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px;">🛒</div>
                                `}
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0;">
                            ${customerName ? `Hi ${customerName},` : 'Hi there,'}<br><br>
                            The <strong>${productName || 'item'}</strong> you reserved is still in your cart—but we only have this one, and another shopper just entered checkout.
                          </p>
                          
                          <p style="font-weight: 600; color: #1f2937; font-size: 18px; margin: 0 0 24px 0;">Claim it first:</p>
                          
                          <!-- CTA Button -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tr>
                              <td style="background-color: #2356A5; border-radius: 8px; box-shadow: 0 4px 6px rgba(1, 82, 86, 0.2);">
                                <a href="${checkoutUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; background-color: #2356A5; border: 1px solid #2356A5;">
                                  <span style="color: #ffffff;">Complete Purchase</span>
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>

                    <!-- Footer Info -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; text-align: center;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">
                          <p style="margin: 0 0 8px 0;"><strong>Why Hoodfair.com?</strong></p>
                          <p style="margin: 0 0 16px 0;">We inspect every item to ensure quality. 30-day returns. Fast shipping.</p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            Questions? Reply here or <a href="https://wa.me/17176484487" style="color: #2356A5; text-decoration: none;">WhatsApp +1-717-648-4487</a>.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Need Help?</h3>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">If you have any questions about your order, our customer service team is here to help.</p>
                    
                    <!-- Contact Links - Stacked Vertically -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <a href="mailto:support@hoodfair.com" style="color: #2356A5; text-decoration: none; font-weight: 500; font-size: 14px; display: block;">📧 Email Support</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <a href="tel:+17176484487" style="color: #2356A5; text-decoration: none; font-weight: 500; font-size: 14px; display: block;">📞 +17176484487</a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      © 2025 Hoodfair.com. All rights reserved.<br>
                      Thank you for your business.
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

    // Plain text version
    const textTemplate = `
      ${customerName ? `${customerName}, someone else is eyeing your ${productName || 'item'} 👀` : `Someone else is eyeing your ${productName || 'item'} 👀`}
      
      ${customerName ? `Hi ${customerName},` : 'Hi there,'}
      
      The ${productName || 'item'} you reserved is still in your cart—but we only have this one, and another shopper just entered checkout.
      
      Claim it first:
      Complete Purchase: ${checkoutUrl}
      
      Questions? Reply here or WhatsApp +1-717-648-4487.
      
      Need Help?
      If you have any questions about your order, our customer service team is here to help.
      
      📧 Email Support (support@hoodfair.com)
      📞 +17176484487
      
      © 2025 Hoodfair.com. All rights reserved.
      Thank you for your business.
    `;

    // Email options
    const mailOptions = {
      from: `"Hoodfair Marketplace" <${account.user}>`,
      to: customerEmail,
      subject: `Hey 👋 ${customerName ? `${customerName}, ` : ''}Your ${productName || 'item'} is waiting!`,
      html: htmlTemplate,
      text: textTemplate,
    };

    // Send email
    const startTime = Date.now();
    const info = await emailTransporter.sendMail(mailOptions);
    const endTime = Date.now();

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Email sent in ${endTime - startTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Abandoned checkout email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);

    // Detailed error handling for network issues
    if (error.code === 'ECONNREFUSED' || error.code === 'ESOCKET') {
      return res.status(503).json({
        error: 'Email Service Unavailable',
        details: 'Network connection to Gmail was refused. Please check your firewall, VPN, or network settings to ensure ports 465/587 are open.'
      });
    }

    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
