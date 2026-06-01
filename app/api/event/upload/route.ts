import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Validar variables de entorno en el momento de la petición
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Configuración incompleta: Faltan credenciales de Supabase en el servidor.' 
      }, { status: 500 });
    }

    // 2. Validar autenticación de sesión
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    // 3. Extraer el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;

    if (!file || !eventId) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (archivo o eventId).' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen válida.' }, { status: 400 });
    }

    // 4. Inicializar el cliente de Supabase de forma segura
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Convertir archivo y preparar subida
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split('.').pop();
    const fileName = `${eventId}/cover_${Date.now()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('invitaciones')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('SUPABASE_STORAGE_ERROR:', error);
      return NextResponse.json({ error: 'Error al subir la imagen al almacenamiento.' }, { status: 500 });
    }

    // 6. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('invitaciones')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      message: 'Imagen subida con éxito.', 
      url: publicUrlData.publicUrl 
    }, { status: 200 });

  } catch (error) {
    console.error('UPLOAD_API_ERROR:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la imagen.' }, { status: 500 });
  }
}