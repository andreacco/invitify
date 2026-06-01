import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers'; // 💡 Ajusta la ruta según dónde lo guardaste
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invitify - Invitaciones Inteligentes',
  description: 'Plataforma premium para la gestión de pases y eventos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 🛡️ Envolvemos toda la app con el proveedor de Next-Auth */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}