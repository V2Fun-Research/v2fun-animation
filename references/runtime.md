# Runtime

`scripts/runtime.py` resolves the installed skill root. Shared V2Fun setup 1.0.0 helpers are integrated into `scripts/`, with protocol major 1 declared in the root `runtime.json`. No nested setup skill or sibling installation is required. The package uses its own helpers; `V2FUN_SETUP_DIR` no longer selects a different runtime.

Use `scripts/v2fun.py --help` for actual commands and their forwarding rules. The bundle includes doctor, init, balance, budget, model execution/recovery, GLB inspection and Node dependency discovery. Model-generation capability is infrastructure only: this animation skill does not call it by default.

Configuration priority: explicit `--config`, project `.v2fun/config.json`, legacy parent `v2fun.local.yaml` (JSON), defaults. Key priority: `V2FUN_API_KEY`, then the selected configuration's `api_key`. Default origin: `https://api.v2fun.art/api/v1`. Never save a key unless requested; never scan home directories for credentials. No key in a frontend or skill package.

Read the bundled [runtime contract](runtime-contract.md) only when setup/dependency/recovery details are needed. Reuse pinned Three.js 0.180.0 when installed; otherwise run `python3 <skill>/scripts/v2fun.py deps --project <dependency-project> --package three@0.180.0`. Pass its package directory explicitly to scaffold. Node.js and Python 3.9+ must exist; no Blender required. Don't install new browser tooling just to copy the starter.

`prepare-default.mjs` is a Three.js-only helper for this untextured default asset: `node <skill>/scripts/prepare-default.mjs <original.glb> <different-output.glb> <three-package-dir>`. It restores bind pose, removes clips on all nodes, exports no animations, and reopens the result. Textured models must use a browser exporter that preserves images; the helper rejects those instead of discarding textures.

## Migration from the nested layout

Replace the installed skill files with the new package and remove the old `vendor/v2fun-setup/` directory. Keep user projects, configurations, task IDs and budget ledgers intact. `scripts/setup.py` remains an alias for existing commands; new commands use `scripts/v2fun.py`. The old `SETUP` Python symbol points to the skill root. Explicit external-runtime overrides are no longer used.
