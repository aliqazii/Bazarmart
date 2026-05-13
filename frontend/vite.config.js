import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",       // Modern JS output — no polyfill overhead
    cssCodeSplit: true,      // Split CSS per route chunk
    reportCompressedSize: false, // Skip gzip estimation for faster builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) return "vendor-react";
          if (id.includes("framer-motion")) return "vendor-motion"; // Isolate framer-motion chunk
          if (id.includes("react-icons") || id.includes("react-hot-toast") || id.includes("axios")) return "vendor-ui";
          if (id.includes("@stripe/react-stripe-js") || id.includes("@stripe/stripe-js")) return "vendor-payments";
          if (id.includes("recharts")) return "vendor-charts";
          if (id.includes("jspdf") || id.includes("jspdf-autotable")) return "vendor-pdf";
        },
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle these on dev server start to avoid blocking first import
    include: ["react", "react-dom", "react-router-dom", "framer-motion", "axios"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    historyApiFallback: true,
  },
});
