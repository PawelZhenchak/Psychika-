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

-- ============================================
-- Historia czatów
-- ============================================

-- Konwersacje
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  title TEXT DEFAULT 'Nowa rozmowa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_clerk_user_id
  ON conversations(clerk_user_id);

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Wiadomości
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id);

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
