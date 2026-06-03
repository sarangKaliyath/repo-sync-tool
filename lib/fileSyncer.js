const fs = require("fs-extra");
const path = require("path");

async function forceRemove(targetPath, retries = 5, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Clear read-only flags recursively before removal so Windows allows rmdir
      if (await fs.pathExists(targetPath)) {
        await clearReadOnly(targetPath);
      }
      await fs.remove(targetPath);
      return;
    } catch (err) {
      if (err.code !== "EPERM" && err.code !== "EBUSY") throw err;
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function clearReadOnly(filePath) {
  const stat = await fs.stat(filePath);
  // 0o200 = owner write bit; OR it in so the file becomes writable
  await fs.chmod(filePath, stat.mode | 0o200);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(filePath);
    await Promise.all(entries.map((e) => clearReadOnly(path.join(filePath, e))));
  }
}

async function syncSrc(runtimeConfig) {
  const { default: ora } = await import("ora");
  const spinner = ora("Syncing src...").start();
  try {
    const sourcePath = path.join(runtimeConfig.mainRepo, runtimeConfig.syncPath);
    const targetPath = path.join(runtimeConfig.remoteRepo, runtimeConfig.syncPath);
    await forceRemove(targetPath);
    await fs.copy(sourcePath, targetPath);
    spinner.succeed("src synced");
  } catch (err) {
    spinner.fail("Failed to sync src");
    throw err;
  }
}

module.exports = { syncSrc };
