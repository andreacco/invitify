import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import EnvelopeWrapper from '@/components/invitation/EnvelopeWrapper';

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ codigoAcceso: string }>;
}) {
  const { codigoAcceso } = await params;

  const invitado = await prisma.invitadoPrincipal.findUnique({
    where: { codigoAcceso },
    include: {
      event: {
        include: {
          template: true,
        },
      },
      asistentes: true,
    },
  });

  if (!invitado || !invitado.event) {
    return notFound();
  }

  // Serialize dates to plain objects for the client component boundary
  const serializedInvitado = JSON.parse(JSON.stringify(invitado));

  return <EnvelopeWrapper invitado={serializedInvitado} evento={serializedInvitado.event} />;
}
