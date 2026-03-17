import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) return "vendor-react";
          if (id.includes("react-icons") || id.includes("react-hot-toast") || id.includes("axios")) return "vendor-ui";
          if (id.includes("@stripe/react-stripe-js") || id.includes("@stripe/stripe-js")) return "vendor-payments";
          if (id.includes("recharts")) return "vendor-charts";
          if (id.includes("jspdf") || id.includes("jspdf-autotable")) return "vendor-pdf";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    historyApiFallback: true, // Enable SPA fallback for client-side routing
  },
});
