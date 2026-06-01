'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('¡Cuenta creada con éxito! Por favor, verifica tu correo antes de iniciar sesión o ingresa tus credenciales.');
    }
    // Si viene rebotado por falta de verificación
    if (searchParams.get('error') === 'unverified') {
      setError('Debes verificar tu correo electrónico antes de acceder al ecosistema.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email: email.toLowerCase().trim(),
      password: password
    });

    if (result?.error) {
      // Manejo específico si Next-Auth rechaza el login por falta de verificación
      if (result.error === 'EmailNotVerified') {
        setError('Tu cuenta aún no ha sido verificada. Revisa tu bandeja de entrada.');
        router.push('/auth/verify');
      } else {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
      setLoading(false);
    } else {
      // 🎯 REDIRECCIÓN AL DASHBOARD PRINCIPAL
      // Dejamos que la raíz del dashboard decida si mostrar el Empty State, 
      // ir al Wizard de nuevo evento, o mandarlo a verificar según su estado real en la DB
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800/80 shadow-2xl z-10 space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Bienvenido a Invitify</h2>
        <p className="text-xs text-zinc-400">Ingresa tus credenciales para gestionar tus eventos</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs text-center font-medium">
          🎉 {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs text-center font-medium">
          ⚠️ {error}
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

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors"
          />
          <Link href="/auth/forgot-password" className="text-[11px] text-zinc-500 hover:text-purple-400 block text-right transition-colors pt-1">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/10 disabled:opacity-50 mt-2"
        >
          {loading ? 'Validando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-zinc-500">
          ¿No tienes una cuenta activa?{' '}
          <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Botón flotante para volver a la Landing */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/60 px-3 py-2 rounded-xl transition-all z-20"
      >
        ← Volver al inicio
      </Link>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="text-zinc-500 text-sm">Cargando portal de acceso...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}