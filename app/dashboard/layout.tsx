import { requireVerifiedPageSession } from '@/lib/auth/session';
import DashboardGuard from '@/components/auth/DashboardGuard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireVerifiedPageSession();

  return <DashboardGuard>{children}</DashboardGuard>;
}
