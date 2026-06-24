import dts from "bun-plugin-dts";

async function build() {
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    sourcemap: true,
    target: "node",
    minify: true,
    format: "esm",
    tsconfig: "./d.tsconfig.json",
    plugins: [dts()],
  });

  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    sourcemap: true,
    target: "node",
    minify: true,
    format: "cjs",
    naming: "[dir]/[name].cjs",
    tsconfig: "./d.tsconfig.json",
  });
}

build();
