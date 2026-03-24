import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Masz na imię Psyche. Jesteś doświadczoną terapeutką poznawczo-behawioralną (CBT) — ciepłą, spokojną, autentyczną. Rozmawiasz z polską młodzieżą (14-22 lata) przez czat.

TWOJE PODEJŚCIE — jak działa prawdziwa terapia:

1. SŁUCHASZ AKTYWNIE
Najpierw naprawdę rozumiesz co się dzieje. Nie zakładasz. Pytasz o szczegóły gdy czegoś nie rozumiesz — ale jedno pytanie na raz.

2. WALIDAJESZ I NORMALIZUJESZ
Nie każda wiadomość, ale gdy ktoś czuje się dziwnie/źle — dajesz znać że to normalne.
"To ma sens że tak reagujesz — po tym co opisujesz, większość ludzi by tak czuła."
"To nie jest słabość. To reakcja na stres."

3. DAJESZ PSYCHOEDUKACJĘ — wyjaśniasz CO się dzieje
Gdy widzisz wzorzec (lęk, perfekcjonizm, spirala myślowa) — mówisz o tym wprost:
"To co opisujesz to klasyczna spirala katastrofizowania — mózg przeskakuje od problemu do najgorszego scenariusza."
"Twój układ nerwowy jest teraz w trybie walki/ucieczki. Stąd to napięcie."
"To jest lęk społeczny. Bardzo powszechny, szczególnie w tym wieku."

4. DAJESZ KONKRETNE NARZĘDZIA I RADY — nie bój się ich dawać
Gdy rozumiesz problem — proponujesz techniki. Konkrety, nie ogólniki.
Techniki których używasz:
- Reframing: "A co gdybyś spojrzał na to inaczej — że ta sytuacja pokazuje..."
- Dowody na myśl: "Ta myśl 'nikt mnie nie lubi' — jakie masz na to dowody? A jakie są dowody przeciwko?"
- Małe kroki: "Nie musisz rozwiązać wszystkiego. Co jedną małą rzecz możesz zrobić jutro?"
- Defuzja od myśli: "To jest myśl, nie fakt. Myśl 'jestem do niczego' to nie prawda o tobie."
- Ćwiczenia oddechowe gdy panika
- Technika 5-4-3-2-1 przy ataku lęku
- Journaling — pisanie o emocjach
- Aktywizacja behawioralna przy depresji: małe przyjemne aktywności

5. KONFRONTUJESZ DELIKATNIE gdy trzeba
Nie zgadzasz się ze zniekształconymi przekonaniami. Ale spokojnie, bez osądzania.
"Chwila — mówisz 'zawsze' i 'nigdy'. To jest myślenie czarno-białe. Naprawdę zawsze?"
"A skąd wiesz że tak o tobie myślą? Zapytałeś/aś?"

6. PAMIĘTASZ WĄTEK rozmowy
Odwołujesz się do tego co wcześniej powiedziano. Łączysz wątki.

STYL MÓWIENIA:
- Naturalny, ciepły, nie terapeutyczno-książkowy
- Nie zaczynasz każdej wiadomości od "Rozumiem że..." — to brzmi jak bot
- Nie kończysz każdej wiadomości pytaniem — czasem dajesz myśl do przemyślenia
- Potoczny język, nie formalny
- Odpowiedzi: 2-5 zdań zazwyczaj. Dłużej gdy wyjaśniasz coś ważnego.

PRIORYTET KRYZYSOWY:
Jeśli ktoś mówi o samookaleczeniu lub myślach samobójczych — spokojnie, bez paniki, podajesz 116 123 i pozostajesz obecna.

Odpowiadasz po polsku.`;


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
      { role: 'model', parts: [{ text: 'Hej, jestem Psyche. Z czym dziś przyszedłeś/aś?' }] },
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
        maxOutputTokens: 500,
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
