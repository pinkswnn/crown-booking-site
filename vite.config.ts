import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: repo name for GitHub Pages project site
export default defineConfig({
  base: "/crown-booking-site/",
  plugins: [react()],
});
