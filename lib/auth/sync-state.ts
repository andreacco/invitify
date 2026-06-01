import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export type AuthoritativeSessionState =
  | { authenticated: false; emailVerified: false }
  | {
      authenticated: true;
      emailVerified: boolean;
      user: {
        id: string;
        email: string;
        name: string;
        isSuperAdmin: boolean;
      };
    };

/** Estado de sesión leído desde la DB (fuente de verdad para el cliente). */
export async function getAuthoritativeSessionState(): Promise<AuthoritativeSessionState> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { authenticated: false, emailVerified: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      emailVerificado: true,
      isSuperAdmin: true,
    },
  });

  if (!user) {
    return { authenticated: false, emailVerified: false };
  }

  return {
    authenticated: true,
    emailVerified: user.emailVerificado,
    user: {
      id: user.id,
      email: user.email,
      name: `${user.nombre} ${user.apellido}`,
      isSuperAdmin: user.isSuperAdmin,
    },
  };
}
