import { prisma } from '@/lib/db';

/** El usuario es dueño del evento o colaborador con status ACEPTADO. */
export async function userCanManageEvent(
  userId: string,
  userEmail: string | null | undefined,
  eventId: string
): Promise<boolean> {
  const email = userEmail?.toLowerCase().trim();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              status: 'ACEPTADO',
              OR: [
                { userId },
                ...(email ? [{ correoInvitado: email }] : []),
              ],
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  return Boolean(event);
}
