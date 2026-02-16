'use client';

import { useState, useEffect } from 'react';

export default function LocalPickupForm() {
    const [customerEmail, setCustomerEmail] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [productLink, setProductLink] = useState('https://www.hoodfair.com');
    const [productName, setProductName] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Fetch available email accounts on mount
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch('/api/get-accounts');
                if (response.ok) {
                    const data = await response.json();
                    setAccounts(data.accounts || []);
                }
            } catch (error) {
                console.error('Failed to fetch email accounts:', error);
            }
        };
        fetchAccounts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            setMessage('❌ Please enter a valid email address');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/send-local-pickup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerEmail: customerEmail.trim(),
                    senderEmail: senderEmail,
                    productLink: productLink,
                    productName: productName
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send email');
            }

            setMessage(`✅ Email sent successfully to ${customerEmail}!`);
            setMessageType('success');

            // Clear form on success
            setCustomerEmail('');
            setProductName('');
            setProductLink('https://www.hoodfair.com');

        } catch (error) {
            console.error('Failed to send email:', error);
            setMessage(`❌ Failed to send email: ${error.message}`);
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    📍 Local Pickup Email
                </h2>
                <p className="text-gray-600 text-sm">
                    Send warehouse pickup information to one customer
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sender Email Selection */}
                <div>
                    <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Send From (Optional)
                    </label>
                    <select
                        id="senderEmail"
                        name="senderEmail"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2356A5] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
                        disabled={isLoading}
                    >
                        <option value="">Random (Auto-Rotate)</option>
                        {accounts.map((account, index) => (
                            <option key={index} value={account.user}>
                                {account.user}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Leave as "Random" to let the system choose.</p>
                </div>

                {/* Product Name */}
                <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                    </label>
                    <input
                        type="text"
                        id="productName"
                        name="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2356A5] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
                        placeholder="e.g., Canon EOS R5 Camera"
                        disabled={isLoading}
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Name of the product available for local pickup.
                    </p>
                </div>

                {/* Product Link */}
                <div>
                    <label htmlFor="productLink" className="block text-sm font-medium text-gray-700 mb-2">
                        Product Link *
                    </label>
                    <input
                        type="url"
                        id="productLink"
                        name="productLink"
                        value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2356A5] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
                        placeholder="https://www.hoodfair.com/product/123"
                        disabled={isLoading}
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Link customers can use to order online if they're far from the warehouse.
                    </p>
                </div>

                {/* Customer Email */}
                <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Email *
                    </label>
                    <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2356A5] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
                        placeholder="customer@example.com"
                        disabled={isLoading}
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Email address of the customer to notify about local pickup.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2356A5] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#1e3a8a] focus:ring-2 focus:ring-[#2356A5] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending Email...
                        </div>
                    ) : (
                        '📧 Send Local Pickup Email'
                    )}
                </button>
            </form>

            {message && (
                <div className={`mt-6 p-4 rounded-lg ${messageType === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message}
                </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                    💡 Single Email Only
                </h3>
                <p className="text-xs text-blue-700">
                    This form sends pickup information to one customer at a time. Enter the product details and customer email to notify them about the local pickup option at our Los Angeles warehouse.
                </p>
            </div>
        </div>
    );
}
