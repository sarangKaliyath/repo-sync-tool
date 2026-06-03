#!/usr/bin/env node
const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  const { version } = require("./package.json");
  console.log(version);
  process.exit(0);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: repo-sync [options]

Options:
  -h, --help     Show this help message
  -v, --version  Show version number

Interactive menu:
  1. Run Sync    Pull repos, sync source files, merge package.json, and push changes
  2. Settings    Configure main/remote repo paths and branch names
  3. View        Show currently configured repos, paths, and branches
  4. Exit        Quit the tool
`);
  process.exit(0);
}

const { config } = require("./lib/config");
const { initGitClients } = require("./lib/gitClients");
const { ensureInitialSetup } = require("./lib/setup");
const { pullRepos } = require("./lib/gitOps");
const { checkRemoteChanges } = require("./lib/remoteChangeDetector");
const { syncSrc } = require("./lib/fileSyncer");
const { mergePackageJson } = require("./lib/packageMerge");
const { buildGitDiff } = require("./lib/diff");
const { commitAndPush } = require("./lib/commit");
const { openSettings } = require("./lib/settings");
const { ask } = require("./lib/utils");

async function run() {
  let runtimeConfig = { ...config };

  runtimeConfig = await ensureInitialSetup(runtimeConfig);
  initGitClients(runtimeConfig);

  while (true) {
    console.log("\n==================================");
    console.log("🚀 Repo Sync Tool");
    console.log("==================================");
    console.log("1. Run Sync");
    console.log("2. Settings");
    console.log("3. View");
    console.log("4. Exit");

    const choice = await ask("Select: ");

    switch (choice) {
      case "1": {
        const mainDisplay = runtimeConfig.mainRepoName || "Main Repo";
        const remoteDisplay = runtimeConfig.remoteRepoName || "Remote Repo";
        console.log(
          `\n  ${mainDisplay} [\x1b[36m${runtimeConfig.mainBranch}\x1b[0m]` +
            ` → ${remoteDisplay} [\x1b[36m${runtimeConfig.remoteBranch}\x1b[0m]`
        );
        const confirm = await ask("\nProceed with sync? (y/n): ");
        if (!["y", "yes"].includes(confirm.toLowerCase())) {
          console.log("Cancelled.");
          break;
        }
        await pullRepos(runtimeConfig);
        await checkRemoteChanges(runtimeConfig);
        await syncSrc(runtimeConfig);
        await mergePackageJson(runtimeConfig);
        await buildGitDiff();
        const pushed = await commitAndPush(runtimeConfig);
        if (pushed) process.exit(0);
        break;
      }

      case "2":
        runtimeConfig = await openSettings(runtimeConfig);
        break;

      case "3": {
        const blue = "\x1b[34m";
        const reset = "\x1b[0m";
        const bold = "\x1b[1m";
        const dim = "\x1b[2m";
        const main = runtimeConfig.mainRepoName || "Main Repo";
        const remote = runtimeConfig.remoteRepoName || "Remote Repo";
        console.log("\n----------------------------------");
        console.log(`${bold}${main}${reset}`);
        console.log(`  path    ${dim}${runtimeConfig.mainRepoUrl || runtimeConfig.mainRepo}${reset}`);
        console.log(`  branch  ${blue}${runtimeConfig.mainBranch}${reset}`);
        console.log(`\n${bold}${remote}${reset}`);
        console.log(`  path    ${dim}${runtimeConfig.remoteRepo}${reset}`);
        console.log(`  branch  ${blue}${runtimeConfig.remoteBranch}${reset}`);
        console.log("----------------------------------");
        break;
      }

      case "4":
        process.exit(0);

      default:
        console.log("Invalid option");
    }
  }
}

run().catch((err) => {
  console.error("❌ Sync failed:", err);
});
