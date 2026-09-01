import { NextResponse } from "next/server";

/**
 * Serves the X avatar same-origin. Cross-origin images load fine in <img> but
 * fail inside the share capture (html-to-image re-fetches them with CORS), so
 * the card photo is proxied through here.
 */
export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("u") ?? "";
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  try {
    const profile = await fetch(`https://api.fxtwitter.com/${handle}`, {
      next: { revalidate: 3600 },
    });
    if (!profile.ok) throw new Error(`profile lookup failed: ${profile.status}`);
    const data = await profile.json();
    const avatarUrl = data?.user?.avatar_url;
    if (typeof avatarUrl !== "string" || !avatarUrl) {
      return NextResponse.json({ error: "no avatar" }, { status: 404 });
    }

    const image = await fetch(avatarUrl.replace("_normal", "_400x400"), {
      next: { revalidate: 86400 },
    });
    if (!image.ok || !image.body) {
      return NextResponse.json({ error: "avatar fetch failed" }, { status: 404 });
    }

    return new Response(image.body, {
      headers: {
        "content-type": image.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "avatar lookup failed" }, { status: 502 });
  }
}
