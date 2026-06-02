const readline = require("readline");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs-extra");

function hash(content) {
  return crypto.createHash("sha1").update(content).digest("hex");
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function branchExists(branches, branchName) {
  return branches.some((b) => {
    const clean = b.replace("remotes/origin/", "");
    return clean === branchName || b === branchName;
  });
}

async function validateGitRepo(repoPath) {
  const gitDir = path.join(repoPath, ".git");
  if (!(await fs.pathExists(gitDir))) {
    throw new Error(`${repoPath} is not a git repository`);
  }
}

module.exports = { hash, ask, branchExists, validateGitRepo };
