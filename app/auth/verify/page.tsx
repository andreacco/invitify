'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; 
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update } = useSession(); 
  
  // 🧠 Añadimos 'waiting' para el estado de cuenta recién creada sin token en URL
  const [status, setStatus] = useState<'loading' | 'waiting' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta en los servidores de Invitify...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    // 🎯 CASO 1: Si NO hay token, significa que el usuario se acaba de registrar
    // y lo redirigimos aquí para que espere y revise su bandeja de entrada.
    if (!token) {
      setStatus('waiting');
      return;
    }

    // 🎯 CASO 2: Sí hay un token, procedemos a golpear el backend para validar
    setStatus('loading');
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fallo en la verificación');
        
        setStatus('success');
        setMessage('¡Tu correo electrónico ha sido verificado con éxito!');

        // Avisamos a Next-Auth en el cliente que el estado de la sesión cambió (emailVerified: true)
        await update();

        // Redirección directa al Dashboard
        setTimeout(() => router.push('/dashboard'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [searchParams, router, update]);

  return (
    <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800/80 shadow-2xl text-center space-y-6 z-10">
      
      {/* ⏳ ESTADO 1: PROCESANDO EL TOKEN */}
      {status === 'loading' && (
        <div className="space-y-4 py-4">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">Validando credenciales</h3>
            <p className="text-xs text-zinc-400 font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* 📬 ESTADO 2: RECIÉN REGISTRADO (Esperando confirmación de correo) */}
      {status === 'waiting' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner shadow-purple-500/5 animate-pulse">
            ✉️
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-zinc-100">¡Verifica tu correo electrónico!</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Hemos enviado un enlace de confirmación a tu bandeja de entrada. Por favor, revísalo y haz clic en el botón para activar tu cuenta.
            </p>
          </div>
          
          <div className="pt-2 border-t border-zinc-800/60 space-y-3">
            <p className="text-[11px] text-zinc-500">¿Ya lo confirmaste en otra pestaña?</p>
            <div className="flex gap-2.5 justify-center">
              <button 
                onClick={() => { router.refresh(); window.location.reload(); }}
                className="cursor-pointer text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/10"
              >
                Ya lo verifiqué ✨
              </button>
              <Link href="/auth/login" className="text-xs font-semibold bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-4 py-2 rounded-xl transition-all">
                Ir al Login
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 ESTADO 3: VERIFICACIÓN EXITOSA */}
      {status === 'success' && (
        <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center text-xl mx-auto">
            ✓
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-100">{message}</h3>
            <p className="text-xs text-zinc-400">Preparando tu panel de control automáticamente...</p>
          </div>
        </div>
      )}

      {/* ⚠️ ESTADO 4: ERROR (Token expirado o inválido) */}
      {status === 'error' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center text-xl mx-auto">
            ⚠️
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-rose-400">No se pudo verificar el enlace</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">{message}</p>
          </div>
          <div className="pt-2">
            <Link href="/auth/login" className="w-full inline-block text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-xl transition-all">
              Volver al Portal de Acceso
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Suspense fallback={<div className="text-zinc-500 text-sm animate-pulse">Cargando portal de verificación...</div>}>
        <VerifyContent/>
      </Suspense>
    </div>
  );
}