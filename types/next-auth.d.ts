import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      isSuperAdmin: boolean;
      emailVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    isSuperAdmin: boolean;
    emailVerificado: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isSuperAdmin: boolean;
    /** Evita colisión con el `emailVerified` OAuth (Date | null) de NextAuth */
    emailVerificado: boolean;
  }
}
