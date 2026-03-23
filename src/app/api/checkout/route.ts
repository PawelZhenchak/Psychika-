import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES: Record<string, string> = {
  premium: process.env.STRIPE_PRICE_PREMIUM!,
  pro: process.env.STRIPE_PRICE_PRO!,
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const { plan } = await req.json();
    const priceId = PRICES[plan];
    if (!priceId) return NextResponse.json({ error: 'Nieprawidłowy plan' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/app/chat?upgraded=1`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
      metadata: { userId, plan },
      locale: 'pl',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    const message = err instanceof Stripe.errors.StripeError
      ? `Błąd płatności: ${err.message}`
      : 'Błąd serwera — spróbuj ponownie';
    const status = err instanceof Stripe.errors.StripeError ? err.statusCode || 500 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
