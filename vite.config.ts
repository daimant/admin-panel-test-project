import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [react()],
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
    },
    server: {
      port: 5173,
      open: true,
      strictPort: false,
      proxy: {
        "/auth": {
          target: "https://dummyjson.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/auth/, "/auth"),
        },
        "/api": {
          target: "https://dummyjson.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: isDev ? "inline" : true,
      target: "es2018",
    },
    define: {
      __DEV__: isDev,
    },
    optimizeDeps: {
      include: ["react", "react-dom", "axios"],
    },
  };
});
