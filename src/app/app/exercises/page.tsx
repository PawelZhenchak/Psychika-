export default function ExercisesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
      <span className="text-5xl">🌬️</span>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Ćwiczenia</h1>
      <p className="text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Wkrótce! Techniki oddechowe i grounding na chwile stresu i paniki.
      </p>
      <div className="px-4 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
        Coming soon
      </div>
    </div>
  );
}
