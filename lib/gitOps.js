const path = require("path");
const fs = require("fs-extra");
const simpleGit = require("simple-git");
const { clients, assertClientsReady } = require("./gitClients");
const { ensureCloned } = require("./gitClone");

async function pullRepos(runtimeConfig) {
  assertClientsReady();
  const { default: ora } = await import("ora");
  const mainName = runtimeConfig.mainRepoName || "Main Repo";
  const remoteName = runtimeConfig.remoteRepoName || "Remote Repo";

  const mainSpinner = ora(`Pulling ${mainName}...`).start();
  try {
    if (runtimeConfig.mainRepoUrl) {
      // Re-clone if cache dir was deleted (e.g. fresh machine)
      const gitDir = path.join(runtimeConfig.mainRepo, ".git");
      if (!(await fs.pathExists(gitDir))) {
        mainSpinner.text = `Cloning ${mainName}...`;
        await ensureCloned(runtimeConfig.mainRepoUrl, runtimeConfig.mainBranch);
        clients.mainRepo = simpleGit(runtimeConfig.mainRepo);
      } else {
        await clients.mainRepo.checkout(runtimeConfig.mainBranch);
        await clients.mainRepo.fetch("origin", runtimeConfig.mainBranch);
        await clients.mainRepo.pull("origin", runtimeConfig.mainBranch);
      }
    } else {
      await clients.mainRepo.checkout(runtimeConfig.mainBranch);
      await clients.mainRepo.fetch("origin", runtimeConfig.mainBranch);
      await clients.mainRepo.pull("origin", runtimeConfig.mainBranch);
    }
    mainSpinner.succeed(`${mainName} pulled`);
  } catch (err) {
    mainSpinner.fail(`Failed to pull ${mainName}`);
    throw err;
  }

  const remoteSpinner = ora(`Pulling ${remoteName}...`).start();
  try {
    await clients.remoteRepo.checkout(runtimeConfig.remoteBranch);
    await clients.remoteRepo.fetch("origin", runtimeConfig.remoteBranch);
    await clients.remoteRepo.pull("origin", runtimeConfig.remoteBranch);
    remoteSpinner.succeed(`${remoteName} pulled`);
  } catch (err) {
    remoteSpinner.fail(`Failed to pull ${remoteName}`);
    throw err;
  }
}

module.exports = { pullRepos };
