const fs = require("fs-extra");
const path = require("path");

function mergeDeps(src, dest) {
  for (const dep in src) {
    if (!dest[dep] || dest[dep] !== src[dep]) {
      dest[dep] = src[dep];
    }
  }
}

async function mergePackageJson(runtimeConfig) {
  console.log("📦 Merging package.json...");

  const srcPkgPath = path.join(runtimeConfig.mainRepo, "package.json");
  const destPkgPath = path.join(runtimeConfig.remoteRepo, "package.json");

  const srcPkg = await fs.readJson(srcPkgPath);
  const destPkg = await fs.readJson(destPkgPath);

  srcPkg.dependencies = srcPkg.dependencies || {};
  destPkg.dependencies = destPkg.dependencies || {};

  mergeDeps(srcPkg.dependencies, destPkg.dependencies);

  await fs.writeJson(destPkgPath, destPkg, { spaces: 2 });
  console.log("✅ package.json merged");
}

module.exports = { mergePackageJson };
