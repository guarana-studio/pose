import { extractorPoseui } from "poseui/unocss";
import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "class",
    }),
  ],
  theme: {
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      primary: {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)",
      },
      secondary: {
        DEFAULT: "var(--secondary)",
        foreground: "var(--secondary-foreground)",
      },
      muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)",
      },
      accent: {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)",
      },
      destructive: "var(--destructive)",
      border: "var(--border)",
      input: "var(--input)",
      ring: "var(--ring)",
      card: {
        DEFAULT: "var(--card)",
        foreground: "var(--card-foreground)",
      },
      popover: {
        DEFAULT: "var(--popover)",
        foreground: "var(--popover-foreground)",
      },
    },
  },
  extractors: [extractorPoseui()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  outputToCssLayers: {
    cssLayerName: (layer) => {
      if (layer === "preflights") return "base";
      if (layer === "default") return "utilities";
      if (layer === "shortcuts") return "utilities.shortcuts";
      return layer; // 'theme', 'components', etc. keep their name
    },
  },
  content: {
    pipeline: {
      include: [
        "src/**/*.ts",
        "node_modules/poseui/dist/presets/tailwind4/index.js",
        "node_modules/poseui/dist/presets/basecoat/index.js",
      ],
    },
  },
});
