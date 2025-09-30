import { defineConfig } from "vite";

export default defineConfig({
  base: "/", // ✅ Netlify tidak butuh subpath
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist", // ✅ hasil build ada di dist
  },
});
