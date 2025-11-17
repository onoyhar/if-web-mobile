export function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
      <div
        className="h-full bg-sky-500 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}