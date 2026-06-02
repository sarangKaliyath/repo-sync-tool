const fs = require("fs-extra");
const path = require("path");

async function syncSrc(runtimeConfig) {
  const { default: ora } = await import("ora");
  const spinner = ora("Syncing src...").start();
  try {
    const sourcePath = path.join(runtimeConfig.mainRepo, runtimeConfig.syncPath);
    const targetPath = path.join(runtimeConfig.remoteRepo, runtimeConfig.syncPath);
    await fs.remove(targetPath);
    await fs.copy(sourcePath, targetPath);
    spinner.succeed("src synced");
  } catch (err) {
    spinner.fail("Failed to sync src");
    throw err;
  }
}

module.exports = { syncSrc };
