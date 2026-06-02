const { clients, assertClientsReady } = require("./gitClients");

async function pullRepos(runtimeConfig) {
  assertClientsReady();
  const { default: ora } = await import("ora");
  const mainName = runtimeConfig.mainRepoName || "Main Repo";
  const remoteName = runtimeConfig.remoteRepoName || "Remote Repo";

  const mainSpinner = ora(`Pulling ${mainName}...`).start();
  try {
    await clients.mainRepo.checkout(runtimeConfig.mainBranch);
    await clients.mainRepo.fetch("origin", runtimeConfig.mainBranch);
    await clients.mainRepo.pull("origin", runtimeConfig.mainBranch);
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
