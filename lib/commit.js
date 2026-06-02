const { clients, assertClientsReady } = require("./gitClients");
const { ask } = require("./utils");

function formatTimestamp() {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, "0");

  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yyyy = now.getFullYear();

  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());

  return `${dd}/${mm}/${yyyy}_${hh}${min}`;
}

async function commitAndPush(runtimeConfig) {
  assertClientsReady();
  const { default: ora } = await import("ora");
  const status = await clients.remoteRepo.status();

  if (status.isClean()) {
    console.log("⚠️ No changes detected.");
    return true;
  }

  // <main_branch> to <remote_branch>_dd/mm/yyyy_hh:mm
  const message =
    `${runtimeConfig.mainBranch} to ${runtimeConfig.remoteBranch}` +
    `_${formatTimestamp()}`;

  const commitSpinner = ora("Staging and committing changes...").start();
  try {
    await clients.remoteRepo.add(".");
    await clients.remoteRepo.commit(message);
    commitSpinner.succeed("Changes committed");
  } catch (err) {
    commitSpinner.fail("Failed to commit changes");
    throw err;
  }

  console.log("\n📊 Changes ready to push:");
  console.log(message);

  const ans = await ask("Push? (y/n): ");
  if (!["y", "yes"].includes(ans.toLowerCase())) {
    console.log("🚫 Cancelled");
    return;
  }

  const pushSpinner = ora("Pushing to remote...").start();
  try {
    await clients.remoteRepo.push("origin", runtimeConfig.remoteBranch);
    pushSpinner.succeed("Pushed successfully");
  } catch (err) {
    pushSpinner.fail("Failed to push");
    throw err;
  }

  return true;
}

module.exports = { commitAndPush };