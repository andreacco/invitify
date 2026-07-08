'use client';

import { useState, useRef } from 'react';

interface Props {
  currentAudioUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export default function AudioUploader({ currentAudioUrl, onUploadSuccess }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Usamos el mismo sistema que ya tienes en tu ImageUploader
  const eventId = "boda-andrea-jose-2026"; 

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 🛡️ ESCUDO 1: Validar que sea Audio
    if (!file.type.includes('audio')) {
      return alert('Por favor, selecciona un archivo de audio válido (MP3/WAV).');
    }

    // 🛡️ ESCUDO 2: Validar el peso (Máximo 8MB para que la invitación cargue rápido)
    const MAX_MB = 8;
    const maxSizeInBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return alert(`La canción pesa ${(file.size / (1024*1024)).toFixed(1)}MB. El máximo permitido es ${MAX_MB}MB para garantizar que la invitación cargue rápido a tus invitados.`);
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    try {
      const response = await fetch('/api/event/upload', {
        method: 'POST',
        body: formData, 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la canción');
      }

      onUploadSuccess(data.url);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Hubo un error al subir tu archivo de música.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-2.5">
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative h-28 border-2 border-dashed border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer group transition-all select-none ${
          isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-500/50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="audio/mp3, audio/mpeg, audio/wav" 
          className="hidden" 
          disabled={isUploading}
        />

        {currentAudioUrl ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl shadow-sm border border-emerald-500/20 group-hover:scale-110 transition-transform">
              🎵
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
              {isUploading ? 'Reemplazando...' : 'Audio Cargado y Listo'}
            </span>
            <div className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity backdrop-blur-sm">
              Subir nueva canción ⬆️
            </div>
          </div>
        ) : (
          <div className="text-center p-4 space-y-1">
            <span className="text-2xl block group-hover:animate-bounce">🎧</span>
            <span className="text-xs font-medium text-zinc-300 block">
              {isUploading ? 'Procesando audio...' : 'Subir archivo MP3'}
            </span>
            <span className="text-[10px] text-zinc-500 font-light block">Formatos: MP3, WAV (Máx. 5MB)</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center flex-col gap-2">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest animate-pulse">Subiendo...</span>
          </div>
        )}
      </div>
    </div>
  );
}