'use client';

import { useState, useEffect, useRef } from 'react';

const EXERCISES = [
  {
    id: 'box',
    icon: '⬜',
    name: 'Box Breathing',
    desc: 'Technika Navy SEALs. Uspokaja w minutę.',
    color: '#A78BFA',
    steps: ['Wdech', 'Zatrzymaj', 'Wydech', 'Zatrzymaj'],
    durations: [4, 4, 4, 4],
    rounds: 4,
  },
  {
    id: '478',
    icon: '🌙',
    name: '4-7-8',
    desc: 'Na bezsenność i silny stres. Działa jak naturalny środek uspokajający.',
    color: '#5EEAD4',
    steps: ['Wdech', 'Zatrzymaj', 'Wydech'],
    durations: [4, 7, 8],
    rounds: 4,
  },
  {
    id: 'grounding',
    icon: '🌿',
    name: '5-4-3-2-1',
    desc: 'Grounding przy ataku paniki. Przywraca do chwili obecnej.',
    color: '#34D399',
    steps: [
      '5 rzeczy które WIDZISZ',
      '4 rzeczy które CZUJESZ dotykiem',
      '3 rzeczy które SŁYSZYSZ',
      '2 rzeczy które WĄCHASZ',
      '1 rzecz którą SMAKUJESZ',
    ],
    durations: [15, 15, 15, 15, 15],
    rounds: 1,
  },
  {
    id: 'relax',
    icon: '☀️',
    name: 'Oddech relaksacyjny',
    desc: 'Prosty i skuteczny. Idealny na codzienne chwile napięcia.',
    color: '#FCD34D',
    steps: ['Wdech', 'Wydech'],
    durations: [4, 6],
    rounds: 6,
  },
];

type Phase = { step: string; duration: number; index: number };

export default function ExercisesPage() {
  const [active, setActive] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exercise = EXERCISES.find(e => e.id === active);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const stopExercise = () => {
    clearTimers();
    setActive(null);
    setPhase(null);
    setProgress(0);
    setRound(1);
    setDone(false);
  };

  const runPhase = (ex: typeof EXERCISES[0], stepIdx: number, currentRound: number) => {
    const step = ex.steps[stepIdx];
    const duration = ex.durations[stepIdx];
    setPhase({ step, duration, index: stepIdx });
    setProgress(0);

    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min((elapsed / (duration * 1000)) * 100, 100));
    }, 100);

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      const nextStep = stepIdx + 1;
      if (nextStep < ex.steps.length) {
        runPhase(ex, nextStep, currentRound);
      } else {
        const nextRound = currentRound + 1;
        if (nextRound <= ex.rounds) {
          setRound(nextRound);
          runPhase(ex, 0, nextRound);
        } else {
          setDone(true);
          setPhase(null);
        }
      }
    }, duration * 1000);
  };

  const startExercise = (id: string) => {
    clearTimers();
    const ex = EXERCISES.find(e => e.id === id)!;
    setActive(id);
    setRound(1);
    setDone(false);
    runPhase(ex, 0, 1);
  };

  useEffect(() => () => clearTimers(), []);

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🌬️ Ćwiczenia</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Techniki oddechowe i grounding na stres</p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full">

        {/* Active exercise */}
        {active && exercise && (
          <div className="mb-6 p-6 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: `1px solid ${exercise.color}44` }}>
            <p className="text-sm font-semibold mb-1" style={{ color: exercise.color }}>{exercise.name}</p>
            {!done ? (
              <>
                <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Runda {round} z {exercise.rounds}</p>

                {/* Circle progress */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="54" fill="none"
                        stroke={exercise.color} strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (progress / 100) * circumference}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold" style={{ color: exercise.color }}>
                        {phase ? Math.ceil(phase.duration * (1 - progress / 100)) : ''}
                      </span>
                      <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>sek</span>
                    </div>
                  </div>
                </div>

                <p className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>{phase?.step}</p>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-6">
                  {exercise.steps.map((s, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all"
                      style={{ background: phase?.index === i ? exercise.color : 'var(--border)' }} />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-4">
                <p className="text-5xl mb-3">✨</p>
                <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Świetna robota!</p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Ćwiczenie ukończone. Jak się czujesz?</p>
              </div>
            )}

            <button onClick={stopExercise}
              className="px-6 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {done ? 'Wróć do listy' : 'Zatrzymaj'}
            </button>
          </div>
        )}

        {/* Exercise list */}
        {!active && (
          <div className="flex flex-col gap-4">
            {EXERCISES.map((ex) => (
              <button key={ex.id} onClick={() => startExercise(ex.id)}
                className="p-5 rounded-2xl text-left transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: ex.color + '22' }}>{ex.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: ex.color }}>{ex.name}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{ex.desc}</p>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full shrink-0"
                    style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>
                    {ex.rounds * ex.durations.reduce((a, b) => a + b, 0)}s
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
