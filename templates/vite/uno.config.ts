import { extractorPoseui } from "poseui/unocss";
import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "class",
    }),
  ],
  extractors: [extractorPoseui()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  outputToCssLayers: {
    cssLayerName: (layer) => {
      if (layer === "preflights") return "base";
      if (layer === "default") return "utilities";
      if (layer === "shortcuts") return "utilities.shortcuts";
      return layer;
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
