'use client';

import React from 'react';
import WaxSealSVG from './WaxSealSVG';

interface EnvelopeProps {
  color: string;
  pattern: 'none' | 'floral' | 'botanical' | 'wheat';
  openingStyle: 'top' | 'middle' | 'left' | 'right';
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
    <div 
      className="absolute inset-0 w-full h-full cursor-pointer perspective-[2000px]"
      onClick={!isOpen ? onOpen : undefined}
      style={{ backgroundColor: color.startsWith('#') ? color : undefined }}
    >
      {/* 1. PATRÓN SVG DE FONDO */}
      {pattern !== 'none' && (
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none text-black">
          <defs>
            <pattern id={`pattern-${pattern}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              {pattern === 'botanical' && <path d="M10 10 Q 20 20 10 30 Q 0 20 10 10 Z" fill="currentColor" />}
              {pattern === 'floral' && <circle cx="20" cy="20" r="5" fill="currentColor" />}
              {pattern === 'wheat' && <path d="M20 0 L22 10 L30 12 L22 14 L20 24 L18 14 L10 12 L18 10 Z" fill="currentColor" />}
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${pattern})`} />
        </svg>
      )}

      {/* 2. LA SOLAPA ANIMADA */}
      <div 
        className={`absolute inset-0 flex items-center justify-center ${getFlapClasses()}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FIX: Se agregó viewBox="0 0 100 100" para que respete las proporciones */}
        <svg className="absolute inset-0 w-full h-full drop-shadow-2xl" preserveAspectRatio="none" viewBox="0 0 100 100">
          {openingStyle === 'top' && <polygon points="0,0 100,0 50,50" fill="rgba(0,0,0,0.15)" />}
          {openingStyle === 'left' && <polygon points="0,0 50,50 0,100" fill="rgba(0,0,0,0.15)" />}
          {openingStyle === 'right' && <polygon points="100,0 50,50 100,100" fill="rgba(0,0,0,0.15)" />}
          {openingStyle === 'middle' && (
            <>
              <polygon points="0,0 50,50 0,100" fill="rgba(0,0,0,0.1)" />
              <polygon points="100,0 50,50 100,100" fill="rgba(0,0,0,0.15)" />
            </>
          )}
        </svg>

        {/* 3. EL SELLO (Ahora centrado nativamente por Flexbox sin clases absolute) */}
        {!isOpen && (
           <WaxSealSVG 
             design={sealDesign} 
             color={sealColor}
             initials={coupleInitials}
             className="w-24 h-24 z-30 transition-transform hover:scale-105"
           />
        )}
      </div>
      
      {!isOpen && (
        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-widest uppercase opacity-60 text-white z-10 animate-pulse w-full text-center">
          Haga clic para abrir
        </span>
      )}
    </div>
  );
}