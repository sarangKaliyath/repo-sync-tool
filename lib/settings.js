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
  console.log(`1. label        [for ${main}]`);
  console.log(`2. path/git url [for ${main}]`);
  console.log(`3. label        [for ${remote}]`);
  console.log(`4. path         [for ${remote}]`);
  const blue = "\x1b[34m";
  const reset = "\x1b[0m";
  console.log(`5. branch       [for ${main} -> ${blue}${runtimeConfig.mainBranch}${reset}]`);
  console.log(`6. branch       [for ${remote} -> ${blue}${runtimeConfig.remoteBranch}${reset}]`);
  console.log("7. sync path");
  console.log("8. back");

  const choice = await ask("Select: ");

  switch (choice) {
    case "1":
      runtimeConfig.mainRepoName =
        (await ask(`label [${main}]: `)) || main;
      break;
    case "2": {
      const input =
        (await ask(`path or git url [${main}]: `)) || mainDisplay;
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
        (await ask(`label [${remote}]: `)) || remote;
      break;
    case "4":
      runtimeConfig.remoteRepo =
        (await ask(`path [${remote}]: `)) || runtimeConfig.remoteRepo;
      break;
    case "5":
      runtimeConfig.mainBranch =
        (await ask(`branch [${main}]: `)) || runtimeConfig.mainBranch;
      break;
    case "6":
      runtimeConfig.remoteBranch =
        (await ask(`branch [${remote}]: `)) || runtimeConfig.remoteBranch;
      break;
    case "7":
      runtimeConfig.syncPath =
        (await ask(`sync path [${runtimeConfig.syncPath}]: `)) ||
        runtimeConfig.syncPath;
      break;
    case "8":
      return runtimeConfig;
  }

  await saveLocalConfig(runtimeConfig);
  initGitClients(runtimeConfig);
  return runtimeConfig;
}

module.exports = { openSettings };
