import type { NextConfig } from "next";

// When `next dev` is reached through a tunnel (Cloudflare Tunnel, ngrok, etc. - needed to test
// camera/mic on a phone, since getUserMedia requires a secure context) the browser's origin is
// the tunnel's public hostname, which differs from the host Next's dev server is bound to.
// Next.js's dev server blocks cross-origin requests to its dev-only resources (the HMR
// WebSocket, and any fetch/module-script request that carries an Origin header) as a CSRF
// protection unless that origin is explicitly allowlisted - otherwise it 403s them silently,
// breaking HMR and, on browsers that attach an Origin header more readily (e.g. Safari), the
// app's own client-side chunks too, which can leave the page fully unhydrated (styled, but with
// no working event handlers).
// https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
const extraDevOrigins = (process.env.NEXT_DEV_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    // Cloudflare "quick tunnels" (`cloudflared tunnel --url http://localhost:3000`) hand out a
    // random *.trycloudflare.com subdomain on every run, so this wildcard covers them without
    // needing to hardcode (and update) a specific hostname each session.
    "*.trycloudflare.com",
    ...extraDevOrigins,
  ],
};

export default nextConfig;
