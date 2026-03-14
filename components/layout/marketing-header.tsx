import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
      <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
        {APP_NAME}
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button>Start free</Button>
        </Link>
      </div>
    </header>
  );
}
