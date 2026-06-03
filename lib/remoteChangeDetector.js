const { clients, assertClientsReady } = require("./gitClients");
const { ask } = require("./utils");

async function checkRemoteChanges(runtimeConfig) {
  assertClientsReady();
  const { default: ora } = await import("ora");
  const spinner = ora("Checking remote for unexpected changes...").start();

  try {
    // Find the most recent sync commit by matching the tool's commit message format:
    // "<mainBranch> to <remoteBranch>_dd/mm/yyyy_hhmm"
    const rawSha = await clients.remoteRepo.raw([
      "log",
      `--grep=to ${runtimeConfig.remoteBranch}_`,
      "--format=%H",
      "-1",
    ]);
    const lastSyncSha = rawSha.trim();

    if (!lastSyncSha) {
      spinner.info("No previous sync commit found — skipping remote change check.");
      return;
    }

    // List files changed in syncPath since the last sync commit
    const rawChanged = await clients.remoteRepo.raw([
      "diff",
      "--name-only",
      `${lastSyncSha}..HEAD`,
      "--",
      runtimeConfig.syncPath,
    ]);

    const changedFiles = rawChanged.trim().split("\n").filter(Boolean);

    if (changedFiles.length === 0) {
      spinner.succeed("No unexpected remote changes detected.");
      return;
    }

    spinner.warn(
      `Remote branch has ${changedFiles.length} file(s) in "${runtimeConfig.syncPath}" changed since last sync:`
    );
    changedFiles.forEach((f) => console.log(`  - ${f}`));
    console.log(
      "\nThese changes exist on the remote branch and will be OVERWRITTEN by sync."
    );

    const answer = await ask("Proceed and overwrite? [y/N]: ");
    if (!["y", "yes"].includes(answer.toLowerCase().trim())) {
      throw new Error(
        `Sync aborted — remote has changes in "${runtimeConfig.syncPath}" that would be overwritten. Resolve them manually before syncing.`
      );
    }
  } catch (err) {
    if (err.message.startsWith("Sync aborted")) throw err;
    spinner.fail("Failed to check remote changes");
    throw err;
  }
}

module.exports = { checkRemoteChanges };
