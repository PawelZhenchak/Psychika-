-- Tabela profili Psychika
CREATE TABLE IF NOT EXISTS psychika_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
  plan_until TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index dla szybkiego wyszukiwania po clerk_user_id
CREATE INDEX IF NOT EXISTS idx_psychika_profiles_clerk_user_id
  ON psychika_profiles(clerk_user_id);

-- RLS wyłączone (service role ma pełny dostęp przez webhook)
ALTER TABLE psychika_profiles DISABLE ROW LEVEL SECURITY;
