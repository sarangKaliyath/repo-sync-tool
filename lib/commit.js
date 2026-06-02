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
  const status = await clients.remoteRepo.status();

  if (status.isClean()) {
    console.log("⚠️ No changes detected.");
    return true;
  }

  // <main_branch> to <remote_branch>_dd/mm/yyyy_hh:mm
  const message =
    `${runtimeConfig.mainBranch} to ${runtimeConfig.remoteBranch}` +
    `_${formatTimestamp()}`;

  await clients.remoteRepo.add(".");
  await clients.remoteRepo.commit(message);

  console.log("\n📊 Changes ready to push:");
  console.log(message);

  const ans = await ask("Push? (y/n): ");
  if (!["y", "yes"].includes(ans.toLowerCase())) {
    console.log("🚫 Cancelled");
    return;
  }

  await clients.remoteRepo.push(
    "origin",
    runtimeConfig.remoteBranch
  );

  console.log("🚀 Pushed successfully");
  return true;
}

module.exports = { commitAndPush };