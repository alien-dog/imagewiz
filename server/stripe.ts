import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const DOMAIN = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.replit.dev`
  : 'http://localhost:5000';

export async function createCheckoutSession(req: Request, res: Response) {
  const { priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature']!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Handle successful payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}