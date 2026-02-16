import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, senderEmail, productLink, productName } = req.body;

    // Validate required fields
    if (!customerEmail) {
      return res.status(400).json({
        error: 'Missing required field: customerEmail'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('=== SENDING LOCAL PICKUP EMAIL ===');
    console.log('Customer Email:', customerEmail);

    // Get the email transporter
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

    // Use provided product link or default
    const productUrl = productLink || 'https://www.hoodfair.com';

    // Local Pickup Information HTML Template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>📍 Local Pickup Available at Hoodfair</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          /* Mobile Responsive Styles - AGGRESSIVE OVERRIDES */
          @media only screen and (max-width: 600px) {
            /* Force larger base font size */
            body {
              font-size: 17px !important;
            }
            
            /* Override ALL paragraph and text elements */
            p, span, div, td, li, a {
              font-size: 17px !important;
              line-height: 1.7 !important;
            }
            
            /* Force larger headings */
            h1, h1 * {
              font-size: 28px !important;
              line-height: 1.3 !important;
            }
            
            h2, h2 * {
              font-size: 24px !important;
              line-height: 1.3 !important;
            }
            
            h3, h3 * {
              font-size: 20px !important;
              line-height: 1.4 !important;
            }
            
            /* Force strong/bold text to be larger */
            strong, b {
              font-size: 17px !important;
            }
            
            /* Adjust padding for mobile */
            .content-cell {
              padding: 24px 16px !important;
            }
            
            /* Make tables full width on mobile */
            .mobile-full-width {
              width: 100% !important;
              max-width: 100% !important;
            }
            
            /* Larger buttons on mobile */
            .cta-button, a[style*="background-color"] {
              padding: 18px 28px !important;
              font-size: 18px !important;
            }
            
            /* Icon sizes */
            .icon-text {
              font-size: 20px !important;
            }
            
            /* Force minimum font size on ALL elements */
            * {
              min-width: 0 !important;
            }
            
            /* Specific overrides for small text */
            [style*="font-size: 12px"],
            [style*="font-size: 13px"],
            [style*="font-size: 16px"],
            [style*="font-size: 17px"] {
              font-size: 17px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa;">
        
        <!-- Wrapper Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 20px 10px;">
              
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 650px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #2356A5; padding: 48px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: inline-block; margin-bottom: 24px;">
                      <img src="cid:hoodfairlogo" alt="Hoodfair" width="180" style="display: block; border: 0; max-width: 100%; height: auto;">
                    </div>
                    
                  </td>
                </tr>

              
                <!-- Headline -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center; background-color: #2356A5;">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                      📍 Local Pickup Available
                    </h1>
                  </td>
                </tr>
                
                <!-- Welcome Section -->
                <tr>
                  <td class="content-cell" style="padding: 40px 32px;">
                    <p style="color: #374151; font-size: 18px; line-height: 1.8; margin: 0 0 20px 0;">
                      Hello,<br><br>
                      ${productName ? `This product <a href="${productUrl}" style="color: #2356A5; font-weight: 600; text-decoration: none;">${productName}</a>` : 'Your selected product'} is available for local pickup! Skip shipping and pick up your purchase directly from our warehouse.
                    </p>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF4D9; border-left: 4px solid #2356A5; border-radius: 8px; margin: 24px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #2356A5; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">💡 Quick & Convenient</p>
                          <p style="color: #2356A5; font-size: 18px; margin: 0; line-height: 1.6;">
                            Save time and shipping costs by picking up items directly from our Los Angeles warehouse.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Warehouse Location -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #2356A5; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      🏢 Our Warehouse Location
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="text-align: center;">
                          <p style="color: #2356A5; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">📍 Hoodfair Warehouse</p>
                          <p style="color: #374151; font-size: 18px; margin: 0 0 8px 0; line-height: 1.6;">
                            <strong>1420 N McKinley Ave</strong><br>
                            Los Angeles, CA 90059<br>
                            United States
                          </p>
                          <div style="margin: 20px 0;">
                            <a href="https://maps.google.com/?q=1420+N+McKinley+Ave,+Los+Angeles,+CA+90059" style="background-color: #2356A5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 17px; display: inline-block;">
                              📍 Get Directions
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- How It Works -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #2356A5; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      How Local Pickup Works
                    </h2>
                    
                    <!-- Step 1 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #2356A5; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">1</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #2356A5; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Visit Our Warehouse</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Come to our warehouse at 1420 N McKinley Ave, Los Angeles during business hours.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 2 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #2356A5; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">2</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #2356A5; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Meet Our Sales Representative</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Show the product photo or listing to one of our friendly sales representatives at the office.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 3 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #2356A5; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">3</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #2356A5; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Check Availability</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Our team will verify that the item is in stock and available for immediate pickup.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 4 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #2356A5; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">4</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #2356A5; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Inspect the Product</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Take your time to inspect the item yourself. We want you to be completely satisfied!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 5 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #2356A5; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">5</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #2356A5; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Make Your Payment</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0 0 8px 0; line-height: 1.6;">Pay conveniently with cash or card via our POS system.</p>
                                <p style="color: #2356A5; font-size: 13px; margin: 0; font-weight: 600;">We accept all major credit cards and cash payments.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Live Far Away? -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="padding: 32px;">
                          <h2 style="color: #2356A5; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
                            🚚 Live Far From Our Warehouse?
                          </h2>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 16px 0;">
                            No problem! You can place your order online and we'll ship it directly to you.
                          </p>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 20px 0;">
                            We offer <strong>fast, free shipping</strong> within the U.S. and Canada with our 30-day return policy.
                          </p>
                          <div style="text-align: center;">
                            <a href="${productUrl}" style="background-color: #2356A5; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(35, 86, 165, 0.5);">
                              Shop This Online
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Business Hours -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #2356A5; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      ⏰ Business Hours
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">📅</span>
                              </td>
                              <td>
                                <h3 style="color: #2356A5; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Monday - Friday</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">9:00 AM - 5:00 PM EST</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">📅</span>
                              </td>
                              <td>
                                <h3 style="color: #2356A5; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Saturday</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">10:00 AM - 3:00 PM EST</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">🚫</span>
                              </td>
                              <td>
                                <h3 style="color: #2356A5; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Sunday</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Closed</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Contact Information -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px; border-top: 1px solid #e5e7eb;">
                    <h2 style="color: #2356A5; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                      📞 Contact Information
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #2356A5; font-size: 16px;">Address:</strong><br>
                          <span style="color: #64748b; font-size: 16px;">1420 N McKinley Ave, Los Angeles, CA 90059, United States</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #2356A5; font-size: 16px;">Phone:</strong><br>
                          <a href="tel:+17176484487" style="color: #2356A5; text-decoration: none; font-size: 16px;">+1 717 648 4487</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #2356A5; font-size: 16px;">Email:</strong><br>
                          <a href="mailto:support@hoodfair.com" style="color: #2356A5; text-decoration: none; font-size: 16px;">support@hoodfair.com</a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2025 Hoodfair. All rights reserved.<br>
                        Thank you for choosing Hoodfair!<br>
                        <span style="color: #cbd5e1; font-size: 10px;">Ref ID: ${Date.now()}</span>
                      </p>
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
      Local Pickup Available at Hoodfair
      
      Hello,
      
      Skip shipping and pick up your purchase directly from our warehouse!
      
      OUR WAREHOUSE LOCATION
      📍 Hoodfair Warehouse
      1420 N McKinley Ave
      Los Angeles, CA 90059
      United States
      
      HOW LOCAL PICKUP WORKS:
      
      1. Visit Our Warehouse
      Come to our warehouse at 1420 N McKinley Ave, Los Angeles during business hours.
      
      2. Meet Our Sales Representative
      Show the product photo or listing to one of our friendly sales representatives at the office.
      
      3. Check Availability
      Our team will verify that the item is in stock and available for immediate pickup.
      
      4. Inspect the Product
      Take your time to inspect the item yourself. We want you to be completely satisfied!
      
      5. Make Your Payment
      Pay conveniently with cash or card via our POS system.
      We accept all major credit cards and cash payments.
      
      LIVE FAR FROM OUR WAREHOUSE?
      No problem! You can place your order online and we'll ship it directly to you.
      We offer fast, free shipping within the U.S. and Canada with our 30-day return policy.
      
      Order online: ${productUrl}
      
      BUSINESS HOURS
      📅 Monday - Friday: 9:00 AM - 5:00 PM EST
      📅 Saturday: 10:00 AM - 3:00 PM EST
      🚫 Sunday: Closed
      
      CONTACT INFORMATION
      Address: 1420 N McKinley Ave, Los Angeles, CA 90059, United States
      Phone: +1 717 648 4487
      Email: support@hoodfair.com
      
      © 2025 Hoodfair. All rights reserved.
      Thank you for choosing Hoodfair!
      
      Ref ID: ${Date.now()}
    `;

    // Construct absolute URL for logo
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const logoUrl = `${protocol}://${host}/hoodfair_logo.svg`;

    const mailOptions = {
      from: `"Hoodfair Marketplace" <support@hoodfair.com>`,
      to: customerEmail,
      subject: `📍 Local Pickup Available at Hoodfair Warehouse`,
      html: htmlTemplate.replace(
        /src="[^"]*"/,
        'src="cid:hoodfairlogo"'
      ),
      text: textTemplate,
      attachments: [
        {
          filename: 'logo.svg',
          path: logoUrl,
          cid: 'hoodfairlogo' // same cid value as in the html img src
        }
      ]
    };

    const startTime = Date.now();
    const info = await emailTransporter.sendMail(mailOptions);
    const endTime = Date.now();

    console.log('Local Pickup email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Email sent in ${endTime - startTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Local Pickup email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
