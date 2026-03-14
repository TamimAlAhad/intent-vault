import Link from "next/link";
import { ArrowRight, BookmarkPlus, BrainCircuit, GalleryVerticalEnd } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingHeader } from "@/components/layout/marketing-header";

const features = [
  {
    title: "Capture anything",
    description: "Save screenshots, links, and quick notes from the same simple flow.",
    icon: BookmarkPlus
  },
  {
    title: "Understand the why",
    description: "AI turns vague saves into a clear intent, summary, and next step.",
    icon: BrainCircuit
  },
  {
    title: "Return with context",
    description: "Browse a tidy dashboard instead of a pile of forgotten tabs and photos.",
    icon: GalleryVerticalEnd
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <MarketingHeader />
      <section className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-16 pt-10 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <Badge className="bg-accent text-accent-foreground">
              AI memory for busy founders
            </Badge>
            <div className="space-y-6">
              <h1 className="max-w-3xl font-serif text-5xl leading-tight text-foreground sm:text-6xl">
                Save now. Remember why later.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                {APP_NAME} helps you collect products, articles, screenshots, and half-formed ideas
                without losing the original intent behind them.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start free
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View the app
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Buy Later", "Research Later", "Task"].map((intent) => (
                <div
                  key={intent}
                  className="rounded-3xl border border-border/70 bg-white/70 px-4 py-3 text-sm text-muted-foreground shadow-sm"
                >
                  <div className="font-medium text-foreground">{intent}</div>
                  <div>Auto-detected and editable before save.</div>
                </div>
              ))}
            </div>
          </div>
          <Card className="surface overflow-hidden border-white/60 p-2 shadow-glow">
            <CardContent className="grid gap-4 p-4">
              <div className="rounded-[24px] bg-stone-900 p-5 text-stone-50">
                <div className="text-xs uppercase tracking-[0.28em] text-stone-400">Intent preview</div>
                <div className="mt-4 text-2xl font-semibold">Nike running shoes</div>
                <div className="mt-3 text-sm text-stone-300">
                  User likely saved a product page for future purchase and comparison.
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge className="bg-orange-500/20 text-orange-200">Buy Later</Badge>
                  <Badge className="bg-white/10 text-stone-100">Shopping</Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-border/70 bg-white p-5">
                  <div className="text-sm font-medium text-foreground">Capture</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Paste a link, upload a screenshot, or write a note.
                  </p>
                </div>
                <div className="rounded-[24px] border border-border/70 bg-white p-5">
                  <div className="text-sm font-medium text-foreground">Review</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Edit the AI result before it ever hits the dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="surface border-white/60">
              <CardContent className="space-y-4 p-6">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </section>
    </main>
  );
}
