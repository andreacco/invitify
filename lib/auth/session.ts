import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export type VerifiedSession = Session & {
  user: NonNullable<Session['user']> & {
    id: string;
    emailVerified: true;
  };
};

async function isEmailVerifiedInDb(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerificado: true },
  });
  return Boolean(user?.emailVerificado);
}

function toVerifiedSession(session: Session): VerifiedSession {
  return {
    ...session,
    user: {
      ...session.user!,
      emailVerified: true,
    },
  };
}

/** Sesión verificada contra la DB (fuente de verdad). */
export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const verified = await isEmailVerifiedInDb(session.user.id);
  if (!verified) return null;

  return toVerifiedSession(session);
}

/** Guard de Server Components / layouts del dashboard. */
export async function requireVerifiedPageSession(): Promise<VerifiedSession> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  const verified = await isEmailVerifiedInDb(session.user.id);
  if (!verified) {
    redirect('/auth/verify');
  }

  return toVerifiedSession(session);
}

export type ApiAuthResult =
  | { ok: true; session: VerifiedSession }
  | { ok: false; response: NextResponse };

/** Guard autoritativo para Route Handlers (complementa proxy.ts). */
export async function requireVerifiedApiSession(): Promise<ApiAuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado.' }, { status: 401 }),
    };
  }

  const verified = await isEmailVerifiedInDb(session.user.id);
  if (!verified) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Debes verificar tu correo electrónico.' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, session: toVerifiedSession(session) };
}
