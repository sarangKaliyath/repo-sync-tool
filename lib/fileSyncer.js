const fs = require("fs-extra");
const path = require("path");

async function syncSrc(runtimeConfig) {
  console.log("📂 Syncing src...");

  const sourcePath = path.join(runtimeConfig.mainRepo, runtimeConfig.syncPath);
  const targetPath = path.join(runtimeConfig.remoteRepo, runtimeConfig.syncPath);

  await fs.remove(targetPath);
  await fs.copy(sourcePath, targetPath);

  console.log("✅ src synced");
}

module.exports = { syncSrc };
