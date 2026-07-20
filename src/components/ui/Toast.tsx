export function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2
      ${type === 'success' ? 'bg-[var(--status-positive)]' : 'bg-[var(--accent-primary)]'} text-white text-sm font-medium`}>
      {message}
    </div>
  );
}
