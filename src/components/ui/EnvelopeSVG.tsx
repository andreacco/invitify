'use client';

import React from 'react';
import WaxSealSVG from './WaxSealSVG';

interface EnvelopeProps {
  color: string;
  pattern: 'none' | 'floral' | 'botanical' | 'wheat' | 'real';
  openingStyle: 'top' | 'middle' | 'left' | 'right' | 'vertical';
  sealDesign: any;
  sealColor: string;
  isOpen: boolean;
  onOpen?: () => void;
  coupleInitials?: string;
}

export default function EnvelopeSVG({ color, pattern, openingStyle, sealDesign, sealColor, isOpen, onOpen, coupleInitials }: EnvelopeProps) {
  
  const getFlapClasses = () => {
    switch (openingStyle) {
      case 'top': return `origin-top transition-all duration-1000 ease-in-out ${isOpen ? '-rotate-x-180 opacity-0' : 'rotate-x-0'}`;
      case 'left': return `origin-left transition-all duration-1000 ease-in-out ${isOpen ? '-rotate-y-180 opacity-0' : 'rotate-y-0'}`;
      case 'right': return `origin-right transition-all duration-1000 ease-in-out ${isOpen ? 'rotate-y-180 opacity-0' : 'rotate-y-0'}`;
      case 'middle': return `origin-center transition-all duration-1000 ease-in-out ${isOpen ? 'scale-x-0 opacity-0' : 'scale-x-100'}`;
      default: return '';
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full cursor-pointer perspective-[2000px]" onClick={!isOpen ? onOpen : undefined}>
      <svg className="w-0 h-0 absolute pointer-events-none">
        <defs>
          <pattern id="pattern-botanical" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M10 10 Q 20 20 10 30 Q 0 20 10 10 Z" fill="currentColor" /></pattern>
          <pattern id="pattern-floral" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="5" fill="currentColor" /></pattern>
          <pattern id="pattern-wheat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 0 L22 10 L30 12 L22 14 L20 24 L18 14 L10 12 L18 10 Z" fill="currentColor" /></pattern>
        </defs>
      </svg>

      <div className={`absolute inset-0 z-20 flex ${openingStyle !== 'vertical' ? 'items-center justify-center' : ''} ${openingStyle !== 'vertical' ? getFlapClasses() : ''}`} style={{ transformStyle: 'preserve-3d' }}>
        
        {/* === APERTURAS CLÁSICAS === */}
        {openingStyle !== 'vertical' && (
          <>
            <svg className="absolute inset-0 w-full h-full drop-shadow-2xl" preserveAspectRatio="none" viewBox="0 0 100 100">
              <rect width="100" height="100" fill={color} />
              {pattern === 'real' ? (
                <image href="/cover-real.jpg" x="0" y="0" width="100" height="100" preserveAspectRatio="none" className="mix-blend-overlay grayscale opacity-80" />
              ) : pattern !== 'none' ? (
                <rect x="0" y="0" width="100" height="100" fill={`url(#pattern-${pattern})`} className="opacity-10 text-black pointer-events-none" />
              ) : null}
            </svg>
            {!isOpen && <WaxSealSVG design={sealDesign} color={sealColor} initials={coupleInitials} className="w-24 h-24 z-30 transition-transform hover:scale-105" />}
          </>
        )}

        {/* === APERTURA VERTICAL ASIMÉTRICA (88% / 12%) === */}
        {openingStyle === 'vertical' && (
          <>
            {/* SOLAPA IZQUIERDA (Abarca hasta el 88% de la pantalla) */}
            <div className={`absolute inset-0 origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(0.87,0,0.13,1)] z-20 ${!isOpen ? 'drop-shadow-[6px_0px_12px_rgba(0,0,0,0.4)]' : ''}`} 
                 style={{ transformStyle: 'preserve-3d', transform: isOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
              
              <div className="absolute inset-0 w-full h-full bg-zinc-300" style={{ clipPath: 'polygon(0 0, 88% 0, 88% 100%, 0 100%)', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }} />
              
              <div className="absolute inset-0 w-full h-full" style={{ clipPath: 'polygon(0 0, 88% 0, 88% 100%, 0 100%)', backfaceVisibility: 'hidden' }}>
                <svg className="w-full h-full">
                  <defs>
                    <mask id="oval-hole-left">
                      <rect width="100%" height="100%" fill="white" />
                      <ellipse cx="42%" cy="50%" rx="110" ry="160" fill="black" className="@md:hidden" />
                      <ellipse cx="50%" cy="50%" rx="160" ry="230" fill="black" className="hidden @md:block" />
                    </mask>
                  </defs>
                  <g mask="url(#oval-hole-left)">
                    <rect width="100%" height="100%" fill={color} />
                    {pattern === 'real' ? (
                      <>
                        <image href="/cover-real.png" width="100%" height="100%" preserveAspectRatio="none" className="@md:hidden mix-blend-overlay grayscale opacity-80" />
                        <image href="/cover-real-1.png" width="100%" height="100%" preserveAspectRatio="none" className="hidden @md:block mix-blend-overlay grayscale opacity-80" />
                      </>
                    ) : pattern !== 'none' ? (
                      <rect width="100%" height="100%" fill={`url(#pattern-${pattern})`} className="opacity-10 text-black pointer-events-none" />
                    ) : null}
                  </g>
                </svg>
              </div>

              {/* El Sello anclado a la nueva línea del 88% */}
              {!isOpen && (
                <div className="absolute top-1/2 left-[88%] -translate-x-1/2 -translate-y-1/2 w-30 h-30 @md:w-28 @md:h-28 z-30 transition-transform hover:scale-105">
                  <WaxSealSVG design={sealDesign} color={sealColor} initials={coupleInitials} className="w-full h-full drop-shadow-2xl" />
                </div>
              )}
            </div>

            {/* SOLAPA DERECHA (El 12% restante) */}
            <div className={`absolute inset-0 origin-right transition-transform duration-[1200ms] ease-[cubic-bezier(0.87,0,0.13,1)] z-10`} 
                 style={{ transformStyle: 'preserve-3d', transform: isOpen ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              
              <div className="absolute inset-0 w-full h-full bg-zinc-300" style={{ clipPath: 'polygon(88% 0, 100% 0, 100% 100%, 88% 100%)', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }} />
              
              <div className="absolute inset-0 w-full h-full" style={{ clipPath: 'polygon(88% 0, 100% 0, 100% 100%, 88% 100%)', backfaceVisibility: 'hidden' }}>
                <svg className="w-full h-full">
                  <defs>
                    <mask id="oval-hole-right">
                      <rect width="100%" height="100%" fill="white" />
                      <ellipse cx="42%" cy="50%" rx="110" ry="160" fill="black" className="@md:hidden" />
                      <ellipse cx="50%" cy="50%" rx="160" ry="230" fill="black" className="hidden @md:block" />
                    </mask>
                    {/* El gradiente oscuro para simular la sombra arrojada sobre la solapa derecha */}
                    <linearGradient id="edge-shadow-right" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </linearGradient>
                  </defs>
                  <g mask="url(#oval-hole-right)">
                    <rect width="100%" height="100%" fill={color} />
                    {pattern === 'real' ? (
                      <>
                        <image href="/cover-real.png" width="100%" height="100%" preserveAspectRatio="none" className="@md:hidden mix-blend-overlay grayscale opacity-80" />
                        <image href="/cover-real-1.png" width="100%" height="100%" preserveAspectRatio="none" className="hidden @md:block mix-blend-overlay grayscale opacity-80" />
                      </>
                    ) : pattern !== 'none' ? (
                      <rect width="100%" height="100%" fill={`url(#pattern-${pattern})`} className="opacity-10 text-black pointer-events-none" />
                    ) : null}
                    
                    {/* Sombra de profundidad en el lado derecho de la apertura (del 88% al 93%) */}
                    <rect x="88%" width="5%" height="100%" fill="url(#edge-shadow-right)" />
                    <line x1="88%" y1="0" x2="88%" y2="100%" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                  </g>
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
      
      {!isOpen && (
        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-widest uppercase opacity-60 text-white z-30 animate-pulse w-full text-center pointer-events-none">
          Haga clic para abrir
        </span>
      )}
    </div>
  );
}