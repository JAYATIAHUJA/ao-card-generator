const UPSTREAM_HOST = "ao-syndicate-pass.pages.dev";
const ROUTE_PREFIX = "/hackathons/syndicate/pass";

export default {
  fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === ROUTE_PREFIX) {
      url.pathname = `${ROUTE_PREFIX}/`;
      return Response.redirect(url.toString(), 308);
    }

    const upstreamUrl = new URL(request.url);
    upstreamUrl.hostname = UPSTREAM_HOST;
    upstreamUrl.protocol = "https:";
    upstreamUrl.pathname = url.pathname.slice(ROUTE_PREFIX.length) || "/";

    const upstreamRequest = new Request(upstreamUrl, request);
    return fetch(upstreamRequest);
  },
};
