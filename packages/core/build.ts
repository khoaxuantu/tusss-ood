async function build() {
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    sourcemap: true,
    target: "node",
    minify: true,
  });
}

build();
