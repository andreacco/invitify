import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden">
      {/* Efecto de luces ambientales en el fondo */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* BARRA DE NAVEGACIÓN */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-zinc-900 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md shadow-purple-600/20">
            I
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-100">Invitify</span>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link href="/auth/login" className="text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5">
            Iniciar Sesión
          </Link>
          <Link href="/auth/signup" className="text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 rounded-xl transition-all">
            Crear Evento
          </Link>
        </nav>
      </header>

      {/* SECCIÓN HERO (PRINCIPAL) */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-medium tracking-wide uppercase">
          ✨ Invitaciones Digitales Inteligentes Multi-Evento
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 max-w-3xl mx-auto leading-[1.15]">
          Diseña experiencias memorables para tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">momentos únicos</span>
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
          Crea, personaliza y gestiona las invitaciones de tus eventos con control de pases familiares, confirmaciones RSVP en tiempo real y pases de acceso con código QR seguro.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link 
            href="/auth/register" 
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/10"
          >
            Comenzar ahora gratis
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all"
          >
            Ver panel demo
          </Link>
        </div>
      </main>

      {/* SECCIÓN DE CARACTERÍSTICAS (FEATURES) */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Feature 1 */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl space-y-3 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
            🎨
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Plantillas Inteligentes</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Nuestra plataforma adapta los bloques visuales, tipografías y paletas de colores de manera nativa según el tipo de celebración, sea una boda, quinceaños o evento corporativo.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl space-y-3 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
            📊
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Control de Pases y RSVP</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Define pases grupales o familiares exactos de manera flexible. Recibe alertas y reportes inmediatos cuando tus invitados confirmen asistencia, restricciones alimenticias o canciones.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl space-y-3 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
            🔒
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Acceso Premium con QR</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Garantiza la máxima seguridad en la puerta de tu recepción mediante un pase digital firmado con QR dinámico que contabiliza las entradas en tiempo real evitando fraudes.
          </p>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="w-full text-center py-8 text-[11px] text-zinc-600 border-t border-zinc-900/60 relative z-10">
        &copy; {new Date().getFullYear()} Invitify. Todos los derechos reservados. Diseñado con precisión para experiencias digitales únicas.
      </footer>
    </div>
  );
}