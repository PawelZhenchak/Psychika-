import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST — save user + ai message pair
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

  const { id } = await params;
  const { userMessage, aiMessage } = await req.json();

  if (!userMessage || !aiMessage) {
    return NextResponse.json({ error: 'Brak wiadomości' }, { status: 400 });
  }

  // Verify ownership
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('id', id)
    .eq('clerk_user_id', userId)
    .single();

  if (!conv) {
    return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  }

  // Insert both messages
  const { error: msgErr } = await supabaseAdmin
    .from('messages')
    .insert([
      { conversation_id: id, role: 'user', text: userMessage },
      { conversation_id: id, role: 'ai', text: aiMessage },
    ]);

  if (msgErr) {
    console.error('Save messages error:', msgErr);
    return NextResponse.json({ error: 'Błąd bazy danych' }, { status: 500 });
  }

  // Update conversation timestamp + title (first message becomes title)
  const { data: msgCount } = await supabaseAdmin
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', id);

  const updateData: Record<string, string> = { updated_at: new Date().toISOString() };

  // Auto-title from first user message (if only 2 messages = first exchange)
  if (msgCount === null || (msgCount as unknown as number) <= 2) {
    updateData.title = userMessage.slice(0, 60) + (userMessage.length > 60 ? '...' : '');
  }

  await supabaseAdmin
    .from('conversations')
    .update(updateData)
    .eq('id', id);

  return NextResponse.json({ saved: true });
}
