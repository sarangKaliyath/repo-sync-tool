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
  const { default: ora } = await import("ora");
  const spinner = ora("Merging package.json...").start();
  try {
    const srcPkgPath = path.join(runtimeConfig.mainRepo, "package.json");
    const destPkgPath = path.join(runtimeConfig.remoteRepo, "package.json");
    const srcPkg = await fs.readJson(srcPkgPath);
    const destPkg = await fs.readJson(destPkgPath);
    srcPkg.dependencies = srcPkg.dependencies || {};
    destPkg.dependencies = destPkg.dependencies || {};
    mergeDeps(srcPkg.dependencies, destPkg.dependencies);
    await fs.writeJson(destPkgPath, destPkg, { spaces: 2 });
    spinner.succeed("package.json merged");
  } catch (err) {
    spinner.fail("Failed to merge package.json");
    throw err;
  }
}

module.exports = { mergePackageJson };
