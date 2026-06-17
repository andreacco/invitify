import React from 'react';

interface WaxSealProps {
  design: string;
  color: string;
  initials?: string;
  className?: string;
}

export default function WaxSealSVG({ design, color, initials = 'A&B', className = '' }: WaxSealProps) {
  // Extraemos solo 2 iniciales máximo para el monograma o el escudo
  const displayInitials = initials.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" style={{ color }}>
        <defs>
          <filter id="wax-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="texture" />
            <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
          </filter>
        </defs>
        
        {/* Borde irregular orgánico de la cera */}
        <path 
          d="M50 2 C75 5, 95 20, 98 48 C99 75, 80 95, 50 98 C22 99, 5 80, 2 50 C1 20, 20 4, 50 2 Z" 
          fill="currentColor" 
          filter="url(#wax-texture)"
        />
        <circle cx="50" cy="50" r="38" fill="currentColor" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        
        {/* RELIEVES INTERNOS (Diseños) */}
        <g fill="#fdf8f6" stroke="#fdf8f6" opacity="0.85">
          
          {/* 1. Loto */}
          {design === 'lotus' && (
            <path d="M50 25 C60 45, 75 50, 75 50 C75 50, 60 55, 50 75 C40 55, 25 50, 25 50 C25 50, 40 45, 50 25 Z" fill="none" strokeWidth="3" />
          )}

          {/* 2. Eucalipto */}
          {design === 'eucalyptus' && (
            <path d="M40 75 Q 35 50 60 30 M 60 30 Q 70 40 50 55 M 60 30 Q 40 25 45 45 M 50 55 Q 35 60 40 75" fill="none" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* 3. Rosa Clásica (Estilizada en un solo trazo) */}
          {design === 'rose' && (
            <path d="M50 50 m -10 0 a 10 10 0 1 0 20 0 a 15 15 0 1 0 -30 0 a 20 20 0 1 0 40 0" fill="none" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* 4. Escudo Heráldico con Iniciales */}
          {design === 'shield' && (
            <>
              <path d="M 30 25 L 70 25 L 70 50 C 70 70 50 85 50 85 C 50 85 30 70 30 50 Z" fill="none" strokeWidth="3" strokeLinejoin="round" />
              <text x="50" y="58" fontSize="20" fontFamily="serif" fontWeight="bold" textAnchor="middle" strokeWidth="1">
                {displayInitials}
              </text>
            </>
          )}

          {/* 5. Monograma Simple */}
          {design === 'monogram' && (
            <text x="50" y="60" fontSize="28" fontFamily="serif" fontStyle="italic" fontWeight="bold" textAnchor="middle" strokeWidth="1">
              {displayInitials}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}