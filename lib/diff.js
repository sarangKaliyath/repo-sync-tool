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
}

module.exports = { depReport, diffReport, buildGitDiff };
