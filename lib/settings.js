const fs = require("fs-extra");
const path = require("path");
const simpleGit = require("simple-git");
const { ask } = require("./utils");
const { saveLocalConfig } = require("./config");
const { initGitClients } = require("./gitClients");
const { isGitUrl, getCacheDir } = require("./gitClone");

async function openSettings(runtimeConfig) {
  const main = runtimeConfig.mainRepoName || "Main Repo";
  const remote = runtimeConfig.remoteRepoName || "Remote Repo";
  const mainDisplay = runtimeConfig.mainRepoUrl || runtimeConfig.mainRepo;

  console.log("\n⚙️ SETTINGS");
  console.log(`1. ${main} label`);
  console.log(`2. ${main} path or git URL`);
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
    case "2": {
      const input =
        (await ask(`${main} path or git URL [${mainDisplay}]: `)) ||
        mainDisplay;
      if (isGitUrl(input)) {
        const cacheDir = getCacheDir(input);
        if (!(await fs.pathExists(path.join(cacheDir, ".git")))) {
          console.log(`\nCloning ${main} into cache...`);
          await fs.ensureDir(cacheDir);
          await simpleGit().clone(input, cacheDir);
        }
        runtimeConfig.mainRepoUrl = input;
        runtimeConfig.mainRepo = cacheDir;
      } else {
        runtimeConfig.mainRepo = input;
        runtimeConfig.mainRepoUrl = "";
      }
      break;
    }
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
