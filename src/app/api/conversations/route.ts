import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET — list user's conversations
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('clerk_user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('List conversations error:', error);
    return NextResponse.json({ error: 'Błąd bazy danych' }, { status: 500 });
  }

  return NextResponse.json({ conversations: data });
}

// POST — create new conversation
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

  const { title } = await req.json().catch(() => ({ title: 'Nowa rozmowa' }));

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ clerk_user_id: userId, title: title || 'Nowa rozmowa' })
    .select('id, title, created_at')
    .single();

  if (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Błąd bazy danych' }, { status: 500 });
  }

  return NextResponse.json(data);
}
