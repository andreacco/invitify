import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import EnvelopeWrapper from '@/components/invitation/EnvelopeWrapper';

export const dynamic = 'force-dynamic';

export default async function PublicInvitationPage({ params }: { params: Promise<{ codigoAcceso: string }> }) {
  const { codigoAcceso } = await params;

  const invitacion = await prisma.invitadoPrincipal.findUnique({
    where: { codigoAcceso },
    include: {
      event: {
        include: {
          template: true,
        }
      },
      asistentes: true,
      paseDigital: true,
    }
  });

  if (!invitacion || !invitacion.event.template) {
    notFound();
  }

  return (
    <main className="w-full h-[100dvh] overflow-hidden bg-black">
      <EnvelopeWrapper invitacion={invitacion} />
    </main>
  );
}