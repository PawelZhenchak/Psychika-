import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId: string = session.metadata?.userId;
      const plan: string = session.metadata?.plan;
      if (userId && plan) {
        await supabaseAdmin.from('psychika_profiles').upsert({
          clerk_user_id: userId,
          plan,
          stripe_customer_id: session.customer ?? null,
          stripe_subscription_id: session.subscription ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'clerk_user_id' });
        console.log(`Plan updated: ${userId} -> ${plan}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await supabaseAdmin.from('psychika_profiles')
        .update({ plan: 'free', stripe_subscription_id: null, updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id);
      console.log(`Subscription cancelled: ${sub.id}`);
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return NextResponse.json({ received: true });
}
