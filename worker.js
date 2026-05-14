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

      return fetch(new Request(backendUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
