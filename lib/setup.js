const fs = require("fs-extra");
const path = require("path");
const simpleGit = require("simple-git");
const { ask, branchExists, validateGitRepo } = require("./utils");
const { saveLocalConfig } = require("./config");
const { isGitUrl, getCacheDir } = require("./gitClone");

async function ensureInitialSetup(runtimeConfig) {
  const needsSetup =
    !runtimeConfig.mainRepo?.trim() || !runtimeConfig.remoteRepo?.trim();

  if (!needsSetup) return runtimeConfig;

  console.log("\n⚙️ First-time setup");

  const mainRepoName =
    (await ask(`Main repo label [${runtimeConfig.mainRepoName}]: `)) ||
    runtimeConfig.mainRepoName;
  const remoteRepoName =
    (await ask(`Remote repo label [${runtimeConfig.remoteRepoName}]: `)) ||
    runtimeConfig.remoteRepoName;

  const mainInput = await ask(`${mainRepoName} path or git URL: `);
  const remoteRepo = await ask(`${remoteRepoName} path: `);

  let mainRepo;
  let mainRepoUrl = "";

  if (isGitUrl(mainInput)) {
    mainRepoUrl = mainInput;
    const cacheDir = getCacheDir(mainInput);
    console.log(`\nCloning ${mainRepoName} into cache...`);
    // Clone without branch first so we can list branches and let user pick
    if (!(await fs.pathExists(path.join(cacheDir, ".git")))) {
      await fs.ensureDir(cacheDir);
      await simpleGit().clone(mainInput, cacheDir);
    }
    mainRepo = cacheDir;
  } else {
    mainRepo = mainInput;
    if (!(await fs.pathExists(mainRepo))) {
      throw new Error(`Main repo not found: ${mainRepo}`);
    }
    await validateGitRepo(mainRepo);
  }

  if (!(await fs.pathExists(remoteRepo))) {
    throw new Error(`Remote repo not found: ${remoteRepo}`);
  }

  await validateGitRepo(remoteRepo);

  const mainGit = simpleGit(mainRepo);
  const remoteGit = simpleGit(remoteRepo);

  const mainBranches = await mainGit.branch(["-a"]);
  const remoteBranches = await remoteGit.branch(["-a"]);

  console.log("\n📂 Main Repo Branches:");
  mainBranches.all.forEach((b) => console.log(" -", b));

  console.log("\n📂 Remote Repo Branches:");
  remoteBranches.all.forEach((b) => console.log(" -", b));

  const mainBranch = await ask(`\nMain branch [${runtimeConfig.mainBranch}]: `);
  const remoteBranch = await ask(
    `Remote branch [${runtimeConfig.remoteBranch}]: `,
  );
  const syncPath =
    (await ask(`Sync path [${runtimeConfig.syncPath}]: `)) ||
    runtimeConfig.syncPath;

  const selectedMain = mainBranch || runtimeConfig.mainBranch;
  const selectedRemote = remoteBranch || runtimeConfig.remoteBranch;

  if (!branchExists(mainBranches.all, selectedMain)) {
    throw new Error(`Main branch "${selectedMain}" does not exist`);
  }
  if (!branchExists(remoteBranches.all, selectedRemote)) {
    throw new Error(`Remote branch "${selectedRemote}" does not exist`);
  }

  const updatedConfig = {
    ...runtimeConfig,
    mainRepoName,
    remoteRepoName,
    mainRepo,
    mainRepoUrl,
    remoteRepo,
    mainBranch: selectedMain,
    remoteBranch: selectedRemote,
    syncPath,
  };

  await saveLocalConfig(updatedConfig);
  return updatedConfig;
}

module.exports = { ensureInitialSetup };
