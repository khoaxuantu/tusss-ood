async function build() {
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    sourcemap: true,
    target: "node",
    minify: true,
    format: "esm",
  });

  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    sourcemap: true,
    target: "node",
    minify: true,
    format: "cjs",
    naming: "[dir]/[name].cjs",
  });
}

build();
