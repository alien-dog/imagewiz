import Stripe from 'stripe';
import { User, CreditPackage } from './db';

// Instantiate Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Credit package to Stripe price mapping (you can adjust based on your needs)
const CREDITS_TO_PRICE_MAPPING = {
  100: 5.99,
  500: 19.99,
  1000: 29.99,
  5000: 99.99,
};

// Create a Stripe checkout session for credit purchase
export async function createCheckoutSession(
  user: User,
  packageDetails: CreditPackage,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageDetails.name,
            description: `${packageDetails.credits} credits for iMagenWiz`,
          },
          unit_amount: Math.round(Number(packageDetails.price) * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    client_reference_id: user.id.toString(),
    metadata: {
      userId: user.id.toString(),
      packageId: packageDetails.id.toString(),
      credits: packageDetails.credits.toString(),
    },
  });
}

// Retrieve a session by ID
export async function getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId);
}

// Verify if a payment is complete
export async function verifyPayment(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId);
  return session.payment_status === 'paid';
}

// Construct a webhook event from payload and signature
export function constructEvent(
  payload: Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Export Stripe for direct access if needed
export { stripe };