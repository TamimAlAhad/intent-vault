import Link from "next/link";
import { Plus } from "lucide-react";

import { getDashboardItems, filterItems } from "@/lib/items";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import type { ItemWithPreview } from "@/lib/types/items";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ItemCard } from "@/components/items/item-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

interface DashboardPageProps {
  searchParams?: Promise<{
    q?: string | string[];
    category?: string | string[];
    sort?: string | string[];
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = firstParam(resolvedSearchParams?.q) ?? "";
  const category = firstParam(resolvedSearchParams?.category) ?? "All";
  const sort = firstParam(resolvedSearchParams?.sort) === "oldest" ? "oldest" : "newest";

  const allItems = await getDashboardItems();
  const items = filterItems(allItems, q, category, sort);

  const counts = allItems.reduce<Record<string, number>>(
    (acc: Record<string, number>, item: ItemWithPreview) => {
      acc.All += 1;
      acc[item.category ?? "General"] = (acc[item.category ?? "General"] ?? 0) + 1;
      return acc;
    },
    { All: 0 }
  );

  const categoryList = [
    "All",
    ...Array.from(
      new Set([
        ...CATEGORY_OPTIONS,
        ...allItems.map((item) => item.category).filter((value): value is string => Boolean(value))
      ])
    )
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <Card className="surface border-white/70">
          <CardContent className="space-y-4 p-5">
            <div>
              <div className="text-sm font-semibold text-foreground">Categories</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse by the reason you saved something.
              </p>
            </div>
            <div className="grid gap-2">
              {categoryList.map((entry) => (
                <Link
                  key={entry}
                  href={`/dashboard?category=${encodeURIComponent(entry)}`}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                    category === entry
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/70 text-muted-foreground hover:bg-white"
                  }`}
                >
                  <span>{entry}</span>
                  <span>{counts[entry] ?? 0}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Dashboard
            </div>
            <h1 className="mt-2 font-serif text-4xl text-foreground">Your saved intent</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Search, filter, and revisit the things that mattered enough to keep.
            </p>
          </div>
          <Link href="/items/new">
            <Button>
              <Plus className="mr-2 size-4" />
              Add item
            </Button>
          </Link>
        </div>

        <Card className="surface border-white/70">
          <CardContent className="p-5">
            <form className="grid gap-3 md:grid-cols-[1fr_200px_160px]">
              <Input name="q" defaultValue={q} placeholder="Search title, summary, or source..." />
              <Select name="category" defaultValue={category}>
                {categoryList.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </Select>
              <Select name="sort" defaultValue={sort}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </Select>
              <div className="md:col-span-3">
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {items.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="surface border-white/70">
            <CardContent className="p-8 text-center">
              <h2 className="font-serif text-3xl text-foreground">Nothing matches yet</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Try another filter or save your first item to start building the vault.
              </p>
              <Link href="/items/new" className="mt-6 inline-flex">
                <Button>Add your first item</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
