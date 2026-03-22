import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧠</span>
          <span className="text-2xl font-bold gradient-text">Psychika</span>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
