import { getUserOrRedirect } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getUserOrRedirect();

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user.email ?? "Account"} />
      <main className="mx-auto max-w-7xl px-6 pb-10 pt-6 lg:px-8">{children}</main>
    </div>
  );
}
