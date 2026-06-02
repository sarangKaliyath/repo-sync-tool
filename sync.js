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
  3. Exit        Quit the tool
`);
  process.exit(0);
}

const { config } = require("./lib/config");
const { initGitClients } = require("./lib/gitClients");
const { ensureInitialSetup } = require("./lib/setup");
const { pullRepos } = require("./lib/gitOps");
const { syncSrc } = require("./lib/fileSyncer");
const { mergePackageJson } = require("./lib/packageMerge");
const { buildGitDiff } = require("./lib/diff");
const { commitAndPush } = require("./lib/commit");
const { openSettings } = require("./lib/settings");
const { ask } = require("./lib/utils");
const { checkEditorOpen } = require("./lib/vscodeCheck");

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
    console.log("3. Exit");

    const choice = await ask("Select: ");

    switch (choice) {
      case "1": {
        const vsCheck = checkEditorOpen(runtimeConfig.remoteRepo);
        if (vsCheck.warned) console.log(vsCheck.message);
        if (!vsCheck.ok) {
          console.log("\n" + vsCheck.reason);
          break;
        }
        await pullRepos(runtimeConfig);
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

      case "3":
        process.exit(0);

      default:
        console.log("Invalid option");
    }
  }
}

run().catch((err) => {
  console.error("❌ Sync failed:", err);
});
