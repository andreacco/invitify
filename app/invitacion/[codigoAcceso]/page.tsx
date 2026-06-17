import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import EnvelopeWrapper from '@/components/invitation/EnvelopeWrapper';

// Forzamos a que sea dinámica para que siempre lea la base de datos en tiempo real
export const dynamic = 'force-dynamic';

export default async function PublicInvitationPage({ params }: { params: Promise<{ codigoAcceso: string }> }) {
  const { codigoAcceso } = await params;

  // 1. Buscamos la invitación por su código único en la URL
  const invitacion = await prisma.invitadoPrincipal.findUnique({
    where: { codigoAcceso },
    include: {
      event: {
        include: {
          template: true, // Traemos la plantilla WYSIWYG
        }
      },
      asistentes: true, // Traemos cuántas personas conforman este grupo familiar
      paseDigital: true, // Traemos el pase dinámico (si ya confirmaron)
    }
  });

  // Si alguien inventa un código o el evento no tiene plantilla, 404
  if (!invitacion || !invitacion.event.template) {
    notFound();
  }

  // 2. Le pasamos toda esta data pura al componente cliente interactivo
  return <EnvelopeWrapper invitacion={invitacion} />;
}