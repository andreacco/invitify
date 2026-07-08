import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Faltan credenciales de Supabase en el servidor.' }, { status: 500 });
    }

    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;

    if (!file || !eventId) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios.' }, { status: 400 });
    }

    // 🚀 FIX: Ahora aceptamos tanto imágenes como audios
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    if (!isImage && !isAudio) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen (JPG/PNG) o un audio (MP3/WAV) válido.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🚀 FIX: Nombramos el archivo de forma inteligente según si es música o foto
    const fileExtension = file.name.split('.').pop() || (isAudio ? 'mp3' : 'jpg');
    const prefix = isAudio ? 'music' : 'cover';
    const fileName = `${eventId}/${prefix}_${Date.now()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('invitaciones')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('SUPABASE_STORAGE_ERROR:', error);
      return NextResponse.json({ error: 'Error al subir al almacenamiento.' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('invitaciones')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      message: 'Archivo subido con éxito.', 
      url: publicUrlData.publicUrl 
    }, { status: 200 });

  } catch (error) {
    console.error('UPLOAD_API_ERROR:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar el archivo.' }, { status: 500 });
  }
}