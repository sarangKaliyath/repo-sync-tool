const { ask } = require("./utils");
const { saveLocalConfig } = require("./config");
const { initGitClients } = require("./gitClients");

async function openSettings(runtimeConfig) {
  const main = runtimeConfig.mainRepoName || "Main Repo";
  const remote = runtimeConfig.remoteRepoName || "Remote Repo";

  console.log("\n⚙️ SETTINGS");
  console.log(`1. ${main} label`);
  console.log(`2. ${main} path`);
  console.log(`3. ${remote} label`);
  console.log(`4. ${remote} path`);
  console.log("5. Main Branch");
  console.log("6. Remote Branch");
  console.log("7. Sync Path");

  const choice = await ask("Select: ");

  switch (choice) {
    case "1":
      runtimeConfig.mainRepoName =
        (await ask(`${main} label [${main}]: `)) || main;
      break;
    case "2":
      runtimeConfig.mainRepo =
        (await ask(`${main} path [${runtimeConfig.mainRepo}]: `)) ||
        runtimeConfig.mainRepo;
      break;
    case "3":
      runtimeConfig.remoteRepoName =
        (await ask(`${remote} label [${remote}]: `)) || remote;
      break;
    case "4":
      runtimeConfig.remoteRepo =
        (await ask(`${remote} path [${runtimeConfig.remoteRepo}]: `)) ||
        runtimeConfig.remoteRepo;
      break;
    case "5":
      runtimeConfig.mainBranch =
        (await ask(`Main Branch [${runtimeConfig.mainBranch}]: `)) ||
        runtimeConfig.mainBranch;
      break;
    case "6":
      runtimeConfig.remoteBranch =
        (await ask(`Remote Branch [${runtimeConfig.remoteBranch}]: `)) ||
        runtimeConfig.remoteBranch;
      break;
    case "7":
      runtimeConfig.syncPath =
        (await ask(`Sync Path [${runtimeConfig.syncPath}]: `)) ||
        runtimeConfig.syncPath;
      break;
  }

  await saveLocalConfig(runtimeConfig);
  initGitClients(runtimeConfig);
  return runtimeConfig;
}

module.exports = { openSettings };
