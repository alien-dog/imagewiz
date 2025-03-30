// Simple script to test direct Stripe redirection

// Get the URL from the first command line argument
const stripeUrl = process.argv[2] || 'https://checkout.stripe.com/c/pay/cs_test_example';

console.log(`Testing Stripe redirect flow with URL: ${stripeUrl}`);
console.log('================================================');
console.log(`
To make a proper Stripe payment flow work:

1. In your browser console, run this JavaScript code:
   window.location.href = "${stripeUrl}";

2. Or click this URL directly:
   ${stripeUrl}
`);