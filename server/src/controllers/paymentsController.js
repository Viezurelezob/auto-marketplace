import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('INLOCUIESTE')) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const PLANS = {
  premium:        { amount: 4900,  currency: 'ron', name: 'Anunț Premium — 30 zile' },
  dealer_starter: { amount: 14900, currency: 'ron', name: 'Dealer Starter — 1 lună' },
  dealer_pro:     { amount: 39900, currency: 'ron', name: 'Dealer Pro — 1 lună' },
};

export const createCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe nu este configurat. Adaugă STRIPE_SECRET_KEY în .env',
    });
  }

  const { listingId, plan = 'premium' } = req.body;
  const planConfig = PLANS[plan];
  if (!planConfig) return res.status(400).json({ error: 'Plan invalid' });

  if (listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Anunț negăsit' });
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Nu ești proprietarul acestui anunț' });
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: planConfig.currency,
        product_data: { name: planConfig.name },
        unit_amount: planConfig.amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    metadata: {
      listingId: listingId || '',
      plan,
      userId: req.user.id,
    },
  });

  res.json({ url: session.url, sessionId: session.id });
};

export const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.json({ received: true });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { listingId, plan } = session.metadata;

    if (listingId) {
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          isPremium: true,
          isFeatured: plan === 'premium' || plan === 'dealer_pro',
        },
      });
    }
  }

  res.json({ received: true });
};
