import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET — load conversation with messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const { data: conv, error: convErr } = await supabaseAdmin
    .from('conversations')
    .select('id, title, created_at')
    .eq('id', id)
    .eq('clerk_user_id', userId)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  }

  // Fetch messages
  const { data: messages, error: msgErr } = await supabaseAdmin
    .from('messages')
    .select('id, role, text, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (msgErr) {
    console.error('Fetch messages error:', msgErr);
    return NextResponse.json({ error: 'Błąd bazy danych' }, { status: 500 });
  }

  return NextResponse.json({ ...conv, messages });
}

// DELETE — delete conversation (cascade deletes messages)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('clerk_user_id', userId);

  if (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Błąd bazy danych' }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
