import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-glow backdrop-blur lg:grid-cols-[1fr_0.95fr]">
        <aside className="surface hidden flex-col justify-between p-10 lg:flex">
          <div className="space-y-8">
            <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
              {APP_NAME}
            </Link>
            <div className="space-y-4">
              <h1 className="font-serif text-5xl leading-tight text-foreground">
                Organize the things you save with the context they deserve.
              </h1>
              <p className="max-w-lg text-base leading-8 text-muted-foreground">
                Save first. Let AI draft the reason, category, and next step. Review the result
                before it becomes part of your system.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              "Add item → AI classify → Review → Save → Browse",
              "Works for screenshots, links, and notes",
              "Each account only sees its own saved items"
            ].map((line) => (
              <div
                key={line}
                className="rounded-3xl border border-border/60 bg-white/70 px-4 py-3 text-sm text-muted-foreground"
              >
                {line}
              </div>
            ))}
          </div>
        </aside>
        <main className="flex items-center justify-center p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
