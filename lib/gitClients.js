const fs = require("fs-extra");
const simpleGit = require("simple-git");

const clients = { mainRepo: null, remoteRepo: null };

async function validateRepo(path) {
  const gitDir = require("path").join(path, ".git");

  if (!(await fs.pathExists(gitDir))) {
    throw new Error(`Not a git repo: ${path}`);
  }
}

async function initGitClients(runtimeConfig) {
  if (!runtimeConfig?.mainRepo || !runtimeConfig?.remoteRepo) {
    throw new Error("Invalid runtimeConfig: missing repo paths");
  }

  // Skip local validation for the main repo when it's driven by a URL —
  // the cache dir is created on first pull, not at init time.
  if (!runtimeConfig.mainRepoUrl) {
    await validateRepo(runtimeConfig.mainRepo);
  }
  await validateRepo(runtimeConfig.remoteRepo);

  clients.mainRepo = simpleGit(runtimeConfig.mainRepo);
  clients.remoteRepo = simpleGit(runtimeConfig.remoteRepo);
}

function assertClientsReady() {
  if (!clients.mainRepo || !clients.remoteRepo) {
    throw new Error("Git clients not initialized");
  }
}

module.exports = {
  clients,
  initGitClients,
  assertClientsReady,
};
