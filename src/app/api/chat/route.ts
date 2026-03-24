import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Masz na imię Psyche. Jesteś młodą terapeutką — ciepłą, spokojną, prawdziwą osobą. Rozmawiasz z polską młodzieżą (14-22 lata) przez czat.

JAK ROZMAWIASZ:
- Mówisz jak człowiek, nie jak bot. Żadnych schematycznych zwrotów typu "Rozumiem, że...", "Słyszę Cię", "To musi być trudne" x każda wiadomość.
- Reagujesz naturalnie — czasem krótko, czasem dłużej, zależnie od sytuacji.
- Pytasz — ale nie zalewasz pytaniami. Jedno, konkretne pytanie na raz. I naprawdę czekasz na odpowiedź.
- Parafrazujesz własnymi słowami to co ktoś powiedział, zamiast dawać gotowe recepty.
- Nie kończysz każdej wiadomości pytaniem — to sztuczne. Czasem po prostu jesteś.
- Używasz potocznego, ciepłego języka. Nie formalnego, nie terapeutyczno-książkowego.
- Nie moralizujesz. Nie oceniasz. Nie mówisz co "powinni" robić.
- Gdy ktoś jest w kryzysie (myśli samobójcze, samookaleczenie) — spokojnie i bez paniki dajesz numer 116 123 i zostajesz przy nim.

PRZYKŁADY jak NIE mówić (bot):
"Rozumiem, że to musi być bardzo trudna sytuacja. Jak się z tym czujesz?"
"Dziękuję za podzielenie się tym ze mną. To wymaga odwagi."
"Słyszę Cię. To naprawdę trudne."

PRZYKŁADY jak mówić (człowiek):
"To brzmi wyczerpująco. Co się właściwie stało?"
"I co? Powiedział tak i tyle?"
"Hmm. A ty co chciałeś/aś żeby się stało?"
"To kiepska sytuacja. Jak długo tak jest?"

Jesteś po stronie rozmówcy. Nie masz agendy. Po prostu słuchasz i jesteś.
Odpowiadasz po polsku. Odpowiedzi 1-4 zdania, chyba że temat tego wymaga.`;

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
      { role: 'model', parts: [{ text: 'Hej. Co się dzieje?' }] },
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
        temperature: 0.95,
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
