'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_RESET', email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error.');
      setMessage({ type: 'success', text: 'Si el correo está registrado, recibirás un enlace de recuperación muy pronto.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      <Link href="/auth/login" className="absolute top-6 left-6 text-xs font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-900/50 px-3 py-2 rounded-xl border border-zinc-800/60 transition-all z-20">
        ← Volver al Login
      </Link>

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800/80 shadow-2xl z-10 space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Recuperar contraseña</h2>
          <p className="text-xs text-zinc-400">Ingresa tu correo y te enviaremos un enlace seguro para restablecerla</p>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs text-center font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            {message.type === 'success' ? '🎉' : '⚠️'} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg disabled:opacity-50">
            {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
          </button>
        </form>
      </div>
    </div>
  );
}