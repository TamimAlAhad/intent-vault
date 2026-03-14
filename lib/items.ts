import { getDomainFromUrl } from "@/lib/utils";
import { STORAGE_BUCKET } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItemWithPreview, SavedItem } from "@/lib/types/items";

export async function getSignedImageUrl(imagePath: string | null) {
  if (!imagePath) {
    return null;
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(imagePath, 60 * 60);

    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

export async function getDashboardItems(): Promise<ItemWithPreview[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const itemsData = data as SavedItem[];

  const items = await Promise.all(
    itemsData.map(async (item) => ({
      ...item,
      imageUrl: await getSignedImageUrl(item.image_path)
    }))
  );

  return items;
}

export async function getItemById(id: string): Promise<ItemWithPreview | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  const item = data as SavedItem;

  return {
    ...item,
    imageUrl: await getSignedImageUrl(item.image_path)
  };
}

export function filterItems<T extends SavedItem>(
  items: T[],
  search: string,
  category: string,
  sort: "newest" | "oldest"
) {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const matchesCategory = category === "All" ? true : item.category === category;
    const haystack = [
      item.ai_title,
      item.ai_summary,
      item.detected_intent,
      item.category,
      item.original_text,
      getDomainFromUrl(item.original_url)
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = normalizedSearch ? haystack.includes(normalizedSearch) : true;

    return matchesCategory && matchesSearch;
  });

  return filtered.sort((a, b) => {
    const first = new Date(a.created_at).getTime();
    const second = new Date(b.created_at).getTime();

    return sort === "oldest" ? first - second : second - first;
  });
}
