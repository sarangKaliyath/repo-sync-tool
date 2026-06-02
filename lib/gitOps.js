const { clients, assertClientsReady } = require("./gitClients");

async function pullRepos(runtimeConfig) {
  assertClientsReady();
  const mainName = runtimeConfig.mainRepoName || "Main Repo";
  const remoteName = runtimeConfig.remoteRepoName || "Remote Repo";

  console.log(`📥 Pulling ${mainName}...`);
  await clients.mainRepo.checkout(runtimeConfig.mainBranch);
  await clients.mainRepo.fetch("origin", runtimeConfig.mainBranch);
  await clients.mainRepo.pull("origin", runtimeConfig.mainBranch);

  console.log(`📥 Pulling ${remoteName}...`);
  await clients.remoteRepo.checkout(runtimeConfig.remoteBranch);
  await clients.remoteRepo.fetch("origin", runtimeConfig.remoteBranch);
  await clients.remoteRepo.pull("origin", runtimeConfig.remoteBranch);
}

module.exports = { pullRepos };
