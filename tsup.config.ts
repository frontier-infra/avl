import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    next: "src/next.ts",
  },
  format: ["esm", "cjs"],
  dts: {
    tsconfig: "tsconfig.build.json",
  },
  clean: true,
  outDir: "dist",
  splitting: true,
  sourcemap: true,
});
