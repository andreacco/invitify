'use client';

import { useState, useRef } from 'react';

interface Props {
  currentImageUrl: string;
  onUploadSuccess: (url: string) => void;
}

export default function ImageUploader({ currentImageUrl, onUploadSuccess }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventId = "boda-andrea-jose-2026"; // ID de tu boda

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    try {
      const response = await fetch('/api/event/upload', {
        method: 'POST',
        body: formData, // FormData establece automáticamente los headers mutipart/form-data
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir');
      }

      // Notificar al componente padre de la nueva URL pública de Supabase
      onUploadSuccess(data.url);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Hubo un error al subir tu fotografía.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <label className="text-xs text-zinc-400 block">Fotografía de Portada</label>
      
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative h-32 border-2 border-dashed border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer group transition-all select-none ${
          isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-500/50'
        }`}
      >
        {/* Input Oculto */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
          disabled={isUploading}
        />

        {currentImageUrl && currentImageUrl !== '/vercel.svg' ? (
          <>
            {/* Vista previa miniatura en el panel lateral */}
            <img 
              src={currentImageUrl} 
              alt="Portada" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium text-white transition-opacity">
              {isUploading ? 'Subiendo...' : 'Cambiar Imagen 📷'}
            </div>
          </>
        ) : (
          <div className="text-center p-4 space-y-1">
            <span className="text-2xl block group-hover:animate-bounce">🖼️</span>
            <span className="text-xs font-medium text-zinc-300 block">
              {isUploading ? 'Subiendo archivo...' : 'Seleccionar fotografía'}
            </span>
            <span className="text-[10px] text-zinc-500 font-light block">Formatos JPG, PNG (Recomendado vertical)</span>
          </div>
        )}

        {/* Spinner de carga superpuesto */}
        {isUploading && (
          <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}