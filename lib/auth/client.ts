export type SyncSessionResponse =
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

type SessionUpdateFn = (data?: unknown) => Promise<unknown>;

/**
 * Consulta la DB vía /api/auth/sync-session y, si el correo ya está verificado,
 * refresca el JWT de NextAuth con update() para alinear cliente y servidor.
 */
export async function syncAuthSession(
  update?: SessionUpdateFn
): Promise<SyncSessionResponse & { jwtRefreshed: boolean }> {
  const res = await fetch('/api/auth/sync-session', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  const data = (await res.json()) as SyncSessionResponse;

  if (!res.ok || !data.authenticated) {
    return { authenticated: false, emailVerified: false, jwtRefreshed: false };
  }

  let jwtRefreshed = false;
  if (data.emailVerified && update) {
    await update();
    jwtRefreshed = true;
  }

  return { ...data, jwtRefreshed };
}
