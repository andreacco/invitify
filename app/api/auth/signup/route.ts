import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellido } = body;

    // 1. Validaciones básicas
    if (!email || !password || !nombre || !apellido) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Verificar si el usuario ya existe en la base de datos
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (usuarioExistente) {
        console.log("El correo electrónico ya está registrado.");
        return NextResponse.json(
        { error: 'El correo electrónico ya está registrado.' },
        { status: 400 },
      );
    }

    // 3. Encriptar la contraseña (Salt de 10 rondas por seguridad/rendimiento)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el usuario en Supabase a través de Prisma
    const nuevoUsuario = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        nombre,
        apellido,
      },
      // Seleccionamos solo lo que queremos devolver al Front (nunca el hash)
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        isSuperAdmin: true,
      },
    });

    return NextResponse.json(
      { message: 'Usuario registrado con éxito.', user: nuevoUsuario },
      { status: 201 }
    );
  } catch (error) {
    console.error('ERROR_SIGNUP_API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}