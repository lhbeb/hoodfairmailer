
const nodemailer = require('nodemailer');

async function testAuth(email, password) {
    console.log(`\nTesting Authentication for: ${email}`);
    console.log('----------------------------------------');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Using port 465 (SSL) as that's what the app uses
        secure: true,
        auth: {
            user: email,
            pass: password
        },
        connectionTimeout: 10000
    });

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS: Credentials for ${email} are valid!`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED: Could not authenticate ${email}`);
        console.error(`   Error Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        if (error.response) {
            console.error(`   Response: ${error.response}`);
        }
        return false;
    }
}

// Credentials from src/config/emailAccounts.js
const accounts = [
    {
        user: 'contactrevibee@gmail.com',
        pass: 'gdui faql dedk yhxg'
    }
];

async function runTests() {
    for (const account of accounts) {
        await testAuth(account.user, account.pass);
    }
}

runTests();
