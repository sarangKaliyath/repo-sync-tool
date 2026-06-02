const { clients, assertClientsReady } = require("./gitClients");

const depReport = {
  added: [],
  changed: [],
};

const diffReport = {
  added: [],
  modified: [],
  deleted: [],
  depsAdded: [],
  depsChanged: [],
};

async function buildGitDiff() {
  assertClientsReady();
  const { default: ora } = await import("ora");
  const spinner = ora("Building diff...").start();
  try {
    const diff = await clients.remoteRepo.diff(["--name-status"]);
    const lines = diff.split("\n").filter(Boolean);

    diffReport.added = [];
    diffReport.modified = [];
    diffReport.deleted = [];

    for (const line of lines) {
      const [status, file] = line.split("\t");
      if (status === "A") diffReport.added.push(file);
      if (status === "M") diffReport.modified.push(file);
      if (status === "D") diffReport.deleted.push(file);
    }
    spinner.succeed("Diff built");
  } catch (err) {
    spinner.fail("Failed to build diff");
    throw err;
  }
}

module.exports = { depReport, diffReport, buildGitDiff };
