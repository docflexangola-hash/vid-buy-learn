import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const plugins = [tanstackStart(), viteReact(), tailwindcss()];

  // Nitro (Vercel preset) só é necessário no build de produção
  if (mode !== "development") {
    plugins.push(nitro({ preset: "vercel" }));
  }

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins,
    optimizeDeps: {
      include: [
        "recharts",
        "@tiptap/react",
        "@tiptap/starter-kit",
        "@tiptap/extension-image",
        "@tiptap/extension-link",
        "@tiptap/extension-underline",
        "pdf-lib",
        "lucide-react",
        "embla-carousel-react",
        "date-fns",
        "sonner",
        "react-day-picker",
        "react-hook-form",
        "@hookform/resolvers",
        "zod",
      ],
    },
  };
});
