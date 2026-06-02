const { spawnSync } = require("child_process");
const path = require("path");

function getVsCodeWindowTitles() {
  const psScript =
    'Get-Process -Name "Code","Code - Insiders" -ErrorAction SilentlyContinue' +
    ' | Where-Object { $_.MainWindowTitle -ne "" }' +
    " | Select-Object -ExpandProperty MainWindowTitle";

  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-NonInteractive", "-Command", psScript],
    { encoding: "utf8", timeout: 5000 }
  );

  if (result.error) return null;
  const output = (result.stdout || "").trim();
  if (!output) return [];
  return output
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function checkVsCodeOpen(remoteRepoPath) {
  const folderName = path.basename(remoteRepoPath.replace(/[\\/]+$/, ""));

  let titles;
  try {
    titles = getVsCodeWindowTitles();
  } catch {
    return {
      ok: true,
      warned: true,
      message: "⚠️  Could not check VS Code windows. Proceeding anyway.",
    };
  }

  if (titles === null) {
    return {
      ok: true,
      warned: true,
      message:
        "⚠️  Could not run PowerShell to check VS Code windows. Proceeding anyway.",
    };
  }

  if (titles.length === 0) {
    return {
      ok: false,
      reason:
        `❌  VS Code does not appear to be running.\n` +
        `    Please open "${folderName}" in VS Code before running sync.`,
    };
  }

  const isOpen =
    titles.some((t) => t.startsWith(folderName)) ||
    titles.some((t) => t.toLowerCase().includes(folderName.toLowerCase()));

  if (!isOpen) {
    return {
      ok: false,
      reason:
        `❌  The remote repo "${folderName}" is not open in VS Code.\n` +
        `    Open it first, then run sync again.\n` +
        `    (Open window(s): ${titles.map((t) => `"${t}"`).join(", ")})`,
    };
  }

  return { ok: true };
}

module.exports = { checkVsCodeOpen };
