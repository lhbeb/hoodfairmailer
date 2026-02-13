
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing SMTP Connection to Gmail...');

  // Method 1: Port 465 (SSL)
  console.log('\n--- Attempting Port 465 (SSL) ---');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'contactrevibee@gmail.com',
        pass: 'gdui faql dedk yhxg'
      },
      // Increase timeout
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });

    await transporter.verify();
    console.log('✅ Port 465 Connection Successful!');
  } catch (error) {
    console.error('❌ Port 465 Failed:', error.code, error.message);
  }

  // Method 2: Port 587 (TLS)
  console.log('\n--- Attempting Port 587 (TLS) ---');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Upgrade later with STARTTLS
      auth: {
        user: 'contactrevibee@gmail.com',
        pass: 'gdui faql dedk yhxg'
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    await transporter.verify();
    console.log('✅ Port 587 Connection Successful!');
  } catch (error) {
    console.error('❌ Port 587 Failed:', error.code, error.message);
  }
}

testSMTP();
