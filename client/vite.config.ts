import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://xq1jpm39-5000.brs.devtunnels.ms",
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: "https://xq1jpm39-5173.brs.devtunnels.ms",
        },
      },
    },
  },
});
