import { NextResponse } from "next/server";

export const dynamic = "force-static";

/**
 * Best-effort X profile lookup. Server-side so the browser never deals with
 * CORS or third-party flakiness; cached for an hour per handle.
 */
export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("u") ?? "";
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return NextResponse.json({ name: null, photo: null }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.fxtwitter.com/${handle}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`profile lookup failed: ${response.status}`);
    const data = await response.json();
    const user = data?.user ?? {};
    const name = typeof user.name === "string" && user.name.trim() ? user.name.trim() : null;
    const photo =
      typeof user.avatar_url === "string"
        ? user.avatar_url.replace("_normal", "_400x400")
        : null;
    return NextResponse.json({ name, photo });
  } catch {
    // The card falls back to the handle when no profile is available.
    return NextResponse.json({ name: null, photo: null });
  }
}
