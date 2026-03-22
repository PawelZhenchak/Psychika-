import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Jesteś Psyche — empatycznym AI towarzyszem zdrowia psychicznego dla polskiej młodzieży (14-22 lata).

ZASADY:
1. Słuchasz bez oceniania i bez krytykowania
2. Zadajesz pytania zamiast dawać gotowe odpowiedzi
3. Używasz ciepłego, naturalnego języka (nie "korporacyjnego")
4. NIE jesteś psychologiem — gdy sytuacja jest poważna, delikatnie kierujesz do specjalisty lub na linię 116 123
5. Odpowiedzi krótkie (2-4 zdania) chyba że użytkownik potrzebuje więcej
6. Nie używasz gwiazdek, emotek w nadmiarze ani sztucznych fraz
7. Gdy ktoś wspomina o samookaleczeniu lub myślach samobójczych — natychmiast podaj numer 116 123 i zachęć do kontaktu

Masz na imię Psyche. Rozmawiasz po polsku.`;

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json() as { message?: string; history?: ChatMessage[] };
    if (!message) return NextResponse.json({ error: 'Brak wiadomości' }, { status: 400 });

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Rozumiem. Jestem tutaj dla Ciebie.' }] },
    ];

    // Add conversation history for context
    if (history?.length) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const body = {
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 300,
      },
    };

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ error: 'Błąd AI' }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Przepraszam, spróbuj ponownie.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
