const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const simpleGit = require("simple-git");

function isGitUrl(input) {
  return (
    input.startsWith("https://") ||
    input.startsWith("http://") ||
    input.startsWith("git@")
  );
}

function getCacheDir(repoUrl) {
  const sanitized = repoUrl
    .replace(/\.git$/, "")
    .replace(/^(https?:\/\/|git@)/, "")
    .replace(/:/g, "/")
    .split("/")
    .filter(Boolean)
    .join("_");
  return path.join(os.homedir(), ".repo-sync-tool", "repos", sanitized);
}

async function ensureCloned(repoUrl, branch) {
  const cacheDir = getCacheDir(repoUrl);
  const gitDir = path.join(cacheDir, ".git");

  if (await fs.pathExists(gitDir)) {
    const git = simpleGit(cacheDir);
    await git.checkout(branch);
    await git.fetch("origin", branch);
    await git.pull("origin", branch);
  } else {
    await fs.ensureDir(cacheDir);
    await simpleGit().clone(repoUrl, cacheDir);
    await simpleGit(cacheDir).checkout(branch);
  }

  return cacheDir;
}

module.exports = { isGitUrl, getCacheDir, ensureCloned };
