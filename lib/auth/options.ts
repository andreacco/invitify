import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error('No se encontró ningún usuario con ese correo.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta.');
        }

        // Permitimos sesión aunque el correo no esté verificado;
        // proxy.ts y las APIs bloquean rutas protegidas hasta verificar.
        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido}`,
          isSuperAdmin: user.isSuperAdmin,
          emailVerificado: user.emailVerificado,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = user.isSuperAdmin;
        token.emailVerificado = user.emailVerificado;
      }

      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { emailVerificado: true, isSuperAdmin: true },
        });

        if (dbUser) {
          token.emailVerificado = dbUser.emailVerificado;
          token.isSuperAdmin = dbUser.isSuperAdmin;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.isSuperAdmin = token.isSuperAdmin;
        session.user.emailVerified = Boolean(token.emailVerificado);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
