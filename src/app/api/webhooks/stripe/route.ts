import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
      const userId: string | undefined = session.metadata?.userId;
      const plan: string | undefined = session.metadata?.plan;

      if (!userId || !plan) {
        console.error('Webhook missing metadata:', { userId, plan, sessionId: session.id });
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      if (!['premium', 'pro'].includes(plan)) {
        console.error('Webhook invalid plan:', plan);
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }

      const { error } = await supabaseAdmin.from('psychika_profiles').upsert({
        clerk_user_id: userId,
        plan,
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_id: session.subscription ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'clerk_user_id' });

      if (error) {
        console.error('Supabase upsert error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      console.log(`Plan updated: ${userId} -> ${plan}`);
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
