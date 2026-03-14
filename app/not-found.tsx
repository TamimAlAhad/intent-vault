import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg space-y-6 rounded-[28px] border border-border bg-white/90 p-8 text-center shadow-sm">
        <div className="text-sm uppercase tracking-[0.28em] text-muted-foreground">404</div>
        <h1 className="font-serif text-4xl text-foreground">This item is not in the vault</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          The page you requested does not exist or you do not have access to it.
        </p>
        <Link href="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
