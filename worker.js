const BACKEND_ORIGIN = "https://obsidian-api-production-8b5e.up.railway.app";

const PROXIED_PATHS = ["/api/", "/sanctum/csrf-cookie", "/auth/"];

function shouldProxy(pathname) {
  return PROXIED_PATHS.some((path) => pathname === path || pathname.startsWith(path));
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (shouldProxy(url.pathname)) {
      const backendUrl = new URL(request.url);
      backendUrl.protocol = "https:";
      backendUrl.host = new URL(BACKEND_ORIGIN).host;

      const backendRequest = new Request(backendUrl, request);

      // The visitor's real IP. Without it, Laravel would see Cloudflare's IP
      // for everyone and the rate limits would count all visitors together.
      // We always overwrite it, so a visitor can't send a fake one.
      backendRequest.headers.set("X-Client-IP", request.headers.get("cf-connecting-ip") ?? "");

      // Shared secret (wrangler secret put PROXY_SECRET). Laravel only
      // accepts requests that carry it, so nobody can skip Cloudflare by
      // calling Railway directly. Without the secret we remove the header,
      // so a visitor can't send their own.
      if (env.PROXY_SECRET) {
        backendRequest.headers.set("X-Proxy-Secret", env.PROXY_SECRET);
      } else {
        backendRequest.headers.delete("X-Proxy-Secret");
      }

      return fetch(backendRequest);
    }

    return env.ASSETS.fetch(request);
  },
};
