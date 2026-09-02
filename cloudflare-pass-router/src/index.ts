const UPSTREAM_HOST = "ao-syndicate-pass.pages.dev";
const ROUTE_PREFIX = "/hackathons/syndicate/pass";
const AVATAR_FALLBACK_HOST = "unavatar.io";
const shortCache = { cf: { cacheTtl: 300, cacheEverything: true } } as RequestInit;
const longCache = { cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit;
const bypassCache = { cf: { cacheTtl: 0 } } as RequestInit;

function getHandle(url: URL) {
  const handle = url.searchParams.get("u") ?? "";
  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : null;
}

function getFallbackAvatarUrl(handle: string) {
  return `https://${AVATAR_FALLBACK_HOST}/x/${handle}`;
}

async function getXProfile(handle: string) {
  const response = await fetch(`https://api.fxtwitter.com/${handle}`, shortCache);
  if (!response.ok) throw new Error(`profile lookup failed: ${response.status}`);
  const data = (await response.json()) as Record<string, unknown>;
  const user = (data.user ?? {}) as Record<string, unknown>;
  const name = typeof user.name === "string" && user.name.trim() ? user.name.trim() : null;
  const photo =
    typeof user.avatar_url === "string"
      ? user.avatar_url.replace("_normal", "_400x400")
      : null;

  return { name, photo };
}

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === ROUTE_PREFIX) {
      url.pathname = `${ROUTE_PREFIX}/`;
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname === `${ROUTE_PREFIX}/api/x-profile`) {
      const handle = getHandle(url);
      if (!handle) return Response.json({ name: null, photo: null }, { status: 400 });
      if (!url.searchParams.has("v")) {
        url.searchParams.set("v", "2");
        return Response.redirect(url.toString(), 307);
      }

      try {
        const profile = await getXProfile(handle);
        profile.photo ??= getFallbackAvatarUrl(handle);
        return Response.json(profile, {
          headers: { "cache-control": "public, max-age=300" },
        });
      } catch {
        return Response.json(
          { name: null, photo: getFallbackAvatarUrl(handle) },
          { headers: { "cache-control": "public, max-age=300" } },
        );
      }
    }

    if (url.pathname === `${ROUTE_PREFIX}/api/x-avatar`) {
      const handle = getHandle(url);
      if (!handle) return Response.json({ error: "invalid handle" }, { status: 400 });
      if (!url.searchParams.has("v")) {
        url.searchParams.set("v", "2");
        return Response.redirect(url.toString(), 307);
      }

      try {
        const profile = await getXProfile(handle).catch(() => ({
          name: null,
          photo: getFallbackAvatarUrl(handle),
        }));
        const photo = profile.photo ?? getFallbackAvatarUrl(handle);

        const image = await fetch(photo, longCache);
        if (!image.ok || !image.body) {
          return Response.json({ error: "avatar fetch failed" }, { status: 404 });
        }

        return new Response(image.body, {
          headers: {
            "cache-control": "public, max-age=86400, immutable",
            "content-type": image.headers.get("content-type") ?? "image/jpeg",
          },
        });
      } catch {
        return Response.json({ error: "avatar lookup failed" }, { status: 502 });
      }
    }

    const upstreamUrl = new URL(request.url);
    upstreamUrl.hostname = UPSTREAM_HOST;
    upstreamUrl.protocol = "https:";
    upstreamUrl.pathname = url.pathname.slice(ROUTE_PREFIX.length) || "/";

    const upstreamRequest = new Request(upstreamUrl, request);
    const response = await fetch(upstreamRequest, bypassCache);
    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
