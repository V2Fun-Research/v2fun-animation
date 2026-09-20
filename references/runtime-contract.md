# Shared runtime contract v1

The package declares protocol major 1 in runtime.json. Call scripts/v2fun.py at its installed path. All shared scripts and references are integrated directly into this skill. No sibling installation is required.

Configuration precedence: explicit --config, project .v2fun/config.json, legacy parent v2fun.local.yaml (JSON content), defaults. Missing or malformed explicit configuration fails. V2FUN_API_KEY overrides the selected configuration's api_key. Init writes only missing non-secret defaults with mode 0600 and does not overwrite existing configuration. Do not keep user credentials inside the skill.

Default region: auto; verify CN/global routing before remote work. Credentials are sent only to the configured API; signed asset downloads do not include Authorization. Doctor only checks local readiness and never validates account authentication. Balance performs a read-only remote query. Neither command generates assets.

Python requires 3.9+ and the standard library. Node/Three.js, Playwright, sharp and Chromium are external optional runtimes according to the domain task. node_runtime.cjs supports explicit --three-dir, project vendor directories, --modules, V2FUN_NODE_MODULES and node_modules/three. Existence is not proof of rendering compatibility. Reuse known dependencies. Install a required exact version only within authorization; deps accepts three, playwright and sharp through npm and does not overwrite mismatched versions. It does not install Node, Blender or a browser automatically. V2FUN_BROWSER may select an existing browser.

Models forwards to v2fun_generate.py: without --generate it inventories parts; --generate --part ID submits or resumes only an authorized part. Budget preserves cumulative authorization records. Status reads a local task record. Inspect reads GLB metadata and does not prove asset quality. See --help for actual parameters.

Parts manifests retain stable IDs, routes and referenceFiles. New AI submissions require checked reference status. assistant_geometry/reuse do not create remote tasks; v2fun_ai3d and legacy user_ai3d are AI routes. Tasks are saved in api-jobs/<id>.json and models in source-models/<id>.glb. Existing file presence is not proof of current input validity. One executor per project uses pipeline.lock and budget-ledger.json. Keep old task IDs and consumed task counts across upgrades. The client never automatically retries POST. Image guidance is documented but has no generic submit command; cross-project limits, rigging and a universal asset registry are not implemented.

Server selection and credential normalization are specified in [server routing](server-routing.md). Historical CN schema/rate examples are not global pricing guarantees. Use the selected documentation host, preserve the task binding, and never silently fall back to CN.
