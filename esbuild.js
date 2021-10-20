const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    outdir: "dist",
    bundle: true,
    sourcemap: true,
    minify: true, // Compressed code
    splitting: true,
    format: "esm",
    target: ["es2015"],
    platform: "browser",
    external: ["*.test.ts"]
  })
  .catch(() => process.exit(1));
