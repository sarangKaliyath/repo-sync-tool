const { clients, assertClientsReady } = require("./gitClients");

const C = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

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

async function displayStagedDiff() {
  assertClientsReady();
  try {
    const nameStatusRaw = await clients.remoteRepo.diff([
      "--cached",
      "--name-status",
    ]);
    const numstatRaw = await clients.remoteRepo.diff([
      "--cached",
      "--numstat",
    ]);

    const statusMap = {};
    nameStatusRaw
      .split("\n")
      .filter(Boolean)
      .forEach((line) => {
        const [status, file] = line.split("\t");
        if (file) statusMap[file.trim()] = status.trim();
      });

    const files = numstatRaw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("\t");
        const added = parseInt(parts[0]) || 0;
        const deleted = parseInt(parts[1]) || 0;
        const file = (parts[2] || "").trim();
        const status = statusMap[file] || "M";
        return { file, added, deleted, status };
      })
      .filter((f) => f.file);

    if (files.length === 0) return;

    const maxLen = Math.max(...files.map((f) => f.file.length), 0);

    console.log(`\n${C.bold}📋 Files to be pushed:${C.reset}`);
    for (const { file, added, deleted, status } of files) {
      let prefix, color;
      if (status === "A") {
        prefix = "[+]";
        color = C.green;
      } else if (status === "D") {
        prefix = "[-]";
        color = C.red;
      } else {
        prefix = "[~]";
        color = C.yellow;
      }

      const pad = " ".repeat(Math.max(0, maxLen - file.length + 2));
      const addedPart =
        added > 0 ? `${C.green}+${added}${C.reset}` : `${C.dim}+0${C.reset}`;
      const deletedPart =
        deleted > 0
          ? `${C.red}-${deleted}${C.reset}`
          : `${C.dim}-0${C.reset}`;

      console.log(
        `  ${color}${prefix}${C.reset} ${file}${pad}${addedPart}  ${deletedPart}`
      );
    }
    console.log();
  } catch {
    // non-fatal — diff display is informational
  }
}

module.exports = { depReport, diffReport, buildGitDiff, displayStagedDiff };
