const { spawnSync } = require("child_process");
const path = require("path");

function getEditorWindowTitles() {
  const psScript =
    'Get-Process -Name "Code","Code - Insiders","Cursor","Antigravity" -ErrorAction SilentlyContinue' +
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

function checkEditorOpen(remoteRepoPath) {
  const folderName = path.basename(remoteRepoPath.replace(/[\\/]+$/, ""));

  let titles;
  try {
    titles = getEditorWindowTitles();
  } catch {
    return {
      ok: true,
      warned: true,
      message: "⚠️  Could not check editor windows. Proceeding anyway.",
    };
  }

  if (titles === null) {
    return {
      ok: true,
      warned: true,
      message:
        "⚠️  Could not run PowerShell to check editor windows. Proceeding anyway.",
    };
  }

  if (titles.length === 0) {
    return {
      ok: false,
      reason:
        `❌  No supported editor (VS Code, Cursor, or Antigravity) appears to be running.\n` +
        `    Please open "${folderName}" in one of them before running sync.`,
    };
  }

  const isOpen =
    titles.some((t) => t.startsWith(folderName)) ||
    titles.some((t) => t.toLowerCase().includes(folderName.toLowerCase()));

  if (!isOpen) {
    return {
      ok: false,
      reason:
        `❌  The remote repo "${folderName}" is not open in any supported editor.\n` +
        `    Open it in VS Code, Cursor, or Antigravity, then run sync again.\n` +
        `    (Open window(s): ${titles.map((t) => `"${t}"`).join(", ")})`,
    };
  }

  return { ok: true };
}

module.exports = { checkEditorOpen };
