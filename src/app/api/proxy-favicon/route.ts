import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ICON_LINK_PATTERN =
  /<link[^>]*rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i;

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const getIconUrl = async (siteUrl: URL) => {
  const pageResponse = await fetch(siteUrl.toString(), {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  if (!pageResponse.ok) {
    return new URL("/favicon.ico", siteUrl.origin).toString();
  }

  const html = await pageResponse.text();
  const match = html.match(ICON_LINK_PATTERN);

  if (!match?.[1]) {
    return new URL("/favicon.ico", siteUrl.origin).toString();
  }

  const href = match[1].trim();

  if (ABSOLUTE_URL_PATTERN.test(href)) {
    return href;
  }

  if (href.startsWith("//")) {
    return `${siteUrl.protocol}${href}`;
  }

  return new URL(href, siteUrl.origin).toString();
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  let siteUrl: URL;

  try {
    siteUrl = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid URL parameter", { status: 400 });
  }

  try {
    const iconUrl = await getIconUrl(siteUrl);
    const iconResponse = await fetch(iconUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!iconResponse.ok) {
      return new NextResponse("Failed to fetch favicon", {
        status: iconResponse.status,
      });
    }

    const buffer = await iconResponse.arrayBuffer();
    const contentType =
      iconResponse.headers.get("content-type") || "image/x-icon";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
