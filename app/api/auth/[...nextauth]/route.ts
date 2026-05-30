import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  // 1. Usaremos estrategia de JWT para máxima velocidad serverless
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // La sesión durará 30 días activa 
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos.');
        }

        // Buscar al usuario con nuestro cliente Prisma adaptado
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error('No se encontró ningún usuario con ese correo.');
        }

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta.');
        }

        // Devolvemos el usuario para armar el token (nunca el hash)
        console.log({id: user.id,
            email: user.email,
            name: `${user.nombre} ${user.apellido}`,
            isSuperAdmin: user.isSuperAdmin,})
        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido}`,
          isSuperAdmin: user.isSuperAdmin,
        };
      }
    })
  ],
  callbacks: {
    // 2. Inyectar datos personalizados en el Token JWT cifrado
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      }
      return token;
    },
    // 3. Exponer esos datos al Frontend (al hacer useSession() o getServerSession())
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Redirección automática si intentan entrar a un sitio protegido
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Exportamos el manejador para los métodos HTTP que requiere NextAuth
export { handler as GET, handler as POST };