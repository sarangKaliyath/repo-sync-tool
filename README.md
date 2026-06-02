# repo-sync-tool

A CLI tool that syncs a source directory and merges `package.json` dependencies from one Git repository to another.

## What It Does

Running `repo-sync` executes a 5-step workflow:

1. **Pull** — checks out the configured branch and pulls latest from `origin` in both repos
2. **Sync files** — removes the `syncPath` directory in the remote repo and replaces it with the contents from the main repo (destructive replace, not a merge)
3. **Merge dependencies** — copies `dependencies` from main repo's `package.json` into remote repo's `package.json`; adds missing entries and updates differing versions; leaves `devDependencies`, `scripts`, and all other fields untouched
4. **Diff** — displays a summary of added, modified, and deleted files
5. **Commit & push** — stages all changes, creates a timestamped commit (`<mainBranch> to <remoteBranch>_dd/mm/yyyy_hhmm`), asks for confirmation, then pushes to the remote branch

## Prerequisites

- Node.js >= 20
- Git installed and on your `PATH`
- Both repositories already cloned locally
- Both repositories have a working `origin` remote (used for pull and push)

## Installation

```bash
npm install -g repo-sync-tool
```

This adds a `repo-sync` command to your PATH.

## First-Run Setup

On the first run (or when repo paths are not configured), the tool launches an interactive setup wizard:

```
repo-sync
```

You will be prompted for:

1. **Main repo label** — a display name for the source repository (default: `Main Repo`)
2. **Remote repo label** — a display name for the target repository (default: `Remote Repo`)
3. **Main repo path** — absolute filesystem path to the cloned source repo
4. **Remote repo path** — absolute filesystem path to the cloned target repo
5. **Main branch** — branch to read from in the source repo (lists available branches)
6. **Remote branch** — branch to write to and push in the target repo (lists available branches)
7. **Sync path** — subdirectory to sync, relative to each repo root (default: `src`)

Configuration is saved to `config.local.json` inside the package install directory. This file is machine-specific and gitignored.

## Usage

```
repo-sync [options]

Options:
  -h, --help     Show this help message
  -v, --version  Show version number

Interactive menu:
  1. Run Sync    Pull repos, sync source files, merge package.json, and push changes
  2. Settings    Configure main/remote repo paths and branch names
  3. Exit        Quit the tool
```

Select **1** to run a full sync, or **2** to reconfigure without syncing.

## Configuration

Two files control the tool's behaviour:

| File | Purpose | Shipped with package |
|---|---|---|
| `config.json` | Default values (empty strings, `syncPath: "src"`) | Yes |
| `config.local.json` | Your machine-specific paths and branch names | No (gitignored) |

At runtime, `config.local.json` is merged on top of `config.json`. If `config.local.json` does not exist, the setup wizard runs automatically.

### Config Fields

| Field | Description | Default |
|---|---|---|
| `mainRepoName` | Display label for the source repo | `"Main Repo"` |
| `remoteRepoName` | Display label for the target repo | `"Remote Repo"` |
| `mainRepo` | Absolute path to the source (main) repo | `""` |
| `remoteRepo` | Absolute path to the target (remote) repo | `""` |
| `mainBranch` | Branch to pull from and read in the main repo | `""` |
| `remoteBranch` | Branch to pull, write to, and push in the remote repo | `""` |
| `syncPath` | Subdirectory to sync (relative to each repo root) | `"src"` |

All fields are editable via the **Settings** menu (option 2).

### Settings Menu Options

1. Main repo label
2. Main repo path
3. Remote repo label
4. Remote repo path
5. Main branch
6. Remote branch
7. Sync path

## Troubleshooting

| Error | Cause |
|---|---|
| `Not a git repo: <path>` | The path has no `.git` directory |
| `Main/Remote repo not found: <path>` | The path does not exist on disk |
| `Main/Remote branch "<name>" does not exist` | Branch not found in local or remote tracking refs |
| Push fails with auth error | Git credential helper or SSH key not configured — set up authentication outside this tool |

## License

ISC
