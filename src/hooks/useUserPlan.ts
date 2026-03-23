import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export type Plan = 'free' | 'premium' | 'pro';

export function useUserPlan() {
  const { user } = useUser();
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.resolve(
      supabase
        .from('psychika_profiles')
        .select('plan')
        .eq('clerk_user_id', user.id)
        .maybeSingle()
    )
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch user plan:', error);
        } else {
          setPlan((data?.plan as Plan) || 'free');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('useUserPlan network error:', err);
        setLoading(false);
      });
  }, [user]);

  const isPremium = plan === 'premium' || plan === 'pro';
  const isPro = plan === 'pro';

  return { plan, isPremium, isPro, loading };
}
