const fs = require("fs-extra");
const path = require("path");

const baseConfig = require("../config.json");
const localConfigPath = path.join(__dirname, "..", "config.local.json");

let localConfig = {};
if (fs.existsSync(localConfigPath)) {
  localConfig = require("../config.local.json");
}

const config = { ...baseConfig, ...localConfig };

async function saveLocalConfig(updatedConfig) {
  const base = require("../config.json");
  const diff = {};

  for (const key in updatedConfig) {
    if (JSON.stringify(updatedConfig[key]) !== JSON.stringify(base[key])) {
      diff[key] = updatedConfig[key];
    }
  }

  await fs.writeJson(path.join(__dirname, "..", "config.local.json"), diff, {
    spaces: 2,
  });

  console.log("💾 Saved to config.local.json");
}

module.exports = { config, saveLocalConfig };
