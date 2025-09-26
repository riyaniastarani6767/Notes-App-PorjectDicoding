// import { defineConfig } from 'vite';
// import { resolve } from 'path';

// // https://vitejs.dev/config/
// export default defineConfig({
//   root: resolve(__dirname, 'src'),
//   publicDir: resolve(__dirname, 'src', 'public'),
//   build: {
//     outDir: resolve(__dirname, 'dist'),
//     emptyOutDir: true,
//   },
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, 'src'),
//     },
//   },
// });

// import { defineConfig } from "vite";

// export default defineConfig({
//   server: { port: 5173 },
// });

import { defineConfig } from "vite";

export default defineConfig({
  base: "/Notes-App-PorjectDicoding/", // ganti sesuai NAMA REPO GitHub-mu
  server: { port: 5173, host: true },
  build: { outDir: "dist" },
});
