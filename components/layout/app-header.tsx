import Link from "next/link";

import { signOutAction } from "@/actions/auth";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  userEmail: string;
}

export function AppHeader({ userEmail }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/items/new">
              <Button variant="ghost" size="sm">
                Add item
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm text-muted-foreground">
            {userEmail}
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
