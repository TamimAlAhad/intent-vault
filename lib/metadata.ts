import type { UrlMetadata } from "@/lib/types/items";

function getMetaTag(html: string, key: string, attribute: "name" | "property") {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "IntentVaultBot/1.0"
      },
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        title: null,
        description: null,
        siteName: null,
        textSnippet: null
      };
    }

    const html = await response.text();
    const title =
      getMetaTag(html, "og:title", "property") ??
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ??
      null;
    const description =
      getMetaTag(html, "description", "name") ??
      getMetaTag(html, "og:description", "property");
    const siteName = getMetaTag(html, "og:site_name", "property");
    const textSnippet = stripHtml(html).slice(0, 600) || null;

    return {
      title,
      description,
      siteName,
      textSnippet
    };
  } catch {
    return {
      title: null,
      description: null,
      siteName: null,
      textSnippet: null
    };
  } finally {
    clearTimeout(timeout);
  }
}
