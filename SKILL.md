---
name: v2fun-animation
license: MIT
description: Turn a user video into a rigged character animation with V2Fun motion capture, Three.js cinematic cameras, an English web viewer, and local video recording with source audio. Use for video-to-character animation and camera previews, including optional hand capture; not for rhythm games or modeling from scratch.
---

# V2Fun Animation

Deliver a working English Three.js viewer with real video-derived animation, cinematic/full-body/free cameras, synchronized source audio, and a Record video button that downloads locally. Respond to the user in their language; the generated interface and skill resources default to English.

## Start with inputs and the hand-capture choice

For a new animation, first acknowledge any supplied files. Request a video attachment if missing. Invite the user to upload a **rigged GLB/FBX model or a PMX model ZIP**, explaining that it is optional: without one, use the bundled [assets/default.glb](assets/default.glb). Do not block on an optional model or ask for files already supplied. Request uploads in the conversation, not through a text-only question tool.

Ask explicitly: **“Do you want hand/finger motion capture?”** Offer body-only (lower cost) and body + hands (higher cost). Reuse a choice already made for this task; otherwise wait for this answer before selecting a paid capture model. While waiting, inspect the video, target skeleton and local environment. A skill-development or documentation request does not authorize a demonstration paid API run.

Inspect video duration, audio, visible people and useful frame range. For several people, identify the intended subject before submitting; the executor does not choose a person intelligently. Inspect the supplied model’s skeleton/skins, bind pose, bone names, finger joints, materials, units and existing clips. A supplied unrigged model is not animation-ready: explain the issue and offer the bundled rigged model, without silently starting a rigging or generation service.

The default GLB is the user-provided white humanoid, renamed **default.glb**, restored to bind pose, and re-exported with **zero animation clips**. Preserve its skeleton, weights, meshes and materials. Never overwrite the original input or use its old animation as video-derived motion. See [default-asset.md](references/default-asset.md).

## Preserve MMD inputs for API retargeting

For the PMX workflow, submit the original PMX model archive (including its relative texture paths) as `input_model` and the selected captured BVH as `input_motion` to `/motions/animations`. Use `application/zip` for a ZIP data URL. Do not convert PMX to GLB, rename its bones, or strip MMD data just to fit the generic GLB executor. Keep the original PMX assets for the MMD viewer.

The local scaffold supports GLB/FBX; the paid quote/animate scripts still assume GLB inputs and GLB retarget outputs and are not a complete PMX executor. Adapt this path before submitting a PMX job, retaining the reviewed input hashes, spending authorization, ledger, single-submission and recovery safeguards. Inspect actual response assets and select the appropriate MMD viewer loader instead of assuming the output is GLB. A ZIP upload-size error is a transport issue: resolve supported upload/asset-URI transport rather than silently changing the model format. A failed task with no diagnostic is not evidence that PMX is unsupported. Do not automatically pay for a retry.

## Guide camera preferences without a technical interview

For a new animation without an explicit camera brief, offer one optional choice in the user's language (it can accompany the hand-capture question):

- **Clear movement**: stable full-body framing, good for reviewing dance or motion.
- **Stage MV**: push-ins, modest orbits and alternating shot sizes for a performance feel.
- **Describe my own**: accept free-text camera direction, including timing, shot sizes, movement and constraints. Do not require technical terms.
- **Choose for me**: review the clip and start with full-body coverage plus gentle movement.

Do not ask about focal lengths, camera coordinates or technical parameters unless the user wants that control. Reuse a clear existing preference rather than asking again. Always invite a free-text description alongside presets, and reuse a supplied description without asking the user to pick a preset. This preference is optional: if the user is unsure, delegates the choice, or skips it, state that you will use **Choose for me** and continue. When asking asynchronously, allow a reasonable response window while doing independent work. This default never substitutes for the required hand-capture answer or paid-service authorization.

Read [camera-preferences.md](references/camera-preferences.md). Persist the selected style as `cameraPreference: clear | mv | auto | custom` in animation.json; pass `--camera-style` to scaffold. The starter implements stable full-body, the existing MV sequence, and a gentle full-body starting sequence respectively. For custom direction, preserve the original text in `cameraBrief` with `--camera-brief`, author `cameraShots` in seconds (optionally `--camera-shots <json>`), and verify the preview against the brief. Free text is interpreted by the agent, not automatically by the browser. Do not deliver a pending custom brief as implemented. The assistant then reviews actions and adapts the sequence; the template does not automatically analyze choreography or beats.

Show a playable preview before requesting refinements. If feedback is needed, ask one concrete question: **“Would you like steadier cameras, closer framing, or more energy?”** Keep Cinematic / Full body / Free view available. Camera-only revisions reuse the same motion and audio and do not create a new V2Fun task.

## Included V2Fun infrastructure

Run `python3 <skill>/scripts/v2fun.py doctor --project <project>`; use `init`, `balance`, `deps`, `budget`, `status`, and `inspect` as needed. Shared infrastructure is integrated directly into `scripts/` and `references/`, matching the flat V2Fun AI 3D layout. No sibling setup skill is required. Nothing requires a machine-specific installation path.

Read [runtime.md](references/runtime.md) for configuration, pinned Three.js reuse and task recovery. Keys belong only in `V2FUN_API_KEY` or the explicit/project configuration accepted by setup. Do not scan personal directories, embed keys in the website, or package API job records. This skill includes infrastructure, not an API account or prepaid credits.

## Before any paid submission: show services, cost and balance

Read [api-and-costs.md](references/api-and-costs.md). After the hand choice and clip selection, run:

```sh
python3 <skill>/scripts/quote.py --project <project> --video <video> --hands no
# Add --model <rigged.glb> when supplied; otherwise use default.glb.
# Use --hands yes for advanced capture. Optional: --start N --duration N.
```

The quote reads current official pricing and live `/balance`; it does **not** submit generation. Present, in the user's language:

- Each planned V2Fun service, selected model, clip duration and number of calls.
- Estimated credits by service and total; distinguish a conservative rounding budget from confirmed billing.
- Current remaining balance, query time, and projected balance after this plan.
- Which operations are local and cost zero V2Fun credits: default-model reuse, local retargeting, Three.js cameras/rendering, recording.

Default body-only route: `turbo` capture + local retargeting. Default hands route: `pro` capture + API animation retargeting; the latter adds its own price and must be named. A locally implemented, verified finger mapping can avoid that extra service; change the quote accordingly before submission. Do not claim pro hand output is validated merely because the task completed.

If pricing or balance cannot be obtained, report it as unavailable, never zero or a remembered value. Continue local work but resolve the missing information before a new paid submission. Reconcile insufficient balance by shortening the clip or changing options with the user. Use existing explicit spending authorization when it covers this concrete plan; otherwise ask for approval of the displayed plan. Never silently upgrade to pro, add paid retries, or substitute paid retargeting.

## Build and execute

1. Reuse an existing project, clips and recorded task IDs when applicable. For a new viewer use `scripts/scaffold.py`; read [viewer.md](references/viewer.md). It copies the English starter, the chosen model and current video, and local Three.js 0.180.0 dependencies. It creates no Site and makes no API call.
2. Save the quote outside published files. Submit once with `scripts/animate.py capture --project <project> --quote-sha256 <reviewed-hash> --authorization <actual-user-authorization>`. It uses the included setup client, project ledger and lock, and records the request before POST. Recovery of an existing task needs only stage and project, using the original plan.
3. For an accepted API-retarget route, run `scripts/animate.py retarget` with the same plan/authorization and selected `--motion-index`. Otherwise inspect source/target bones and perform local world-space bind-pose retargeting. Starter mappings target this default Mixamo-style skeleton; they are not universal.
4. For hands, inspect source finger channels and animated target finger tracks, their actual variation, left/right mapping and visible finger motion. The local GLB/FBX adapter maps 30 finger joints when hands are requested; validate their actual motion before marking handMappingVerified. A hands request is incomplete until meaningful fingers are transferred or the user accepts a disclosed limitation.
5. Read [alignment-and-layout.md](references/alignment-and-layout.md). Center the first captured root on the stage while retaining travel, calibrate fixed pitch/roll per model, and include Side view. Never copy an example model’s tilt angle blindly. Apply the selected camera preference, then adapt shot timing to this clip and action; the starter scales the selected sequence to media duration. Keep full-body and orbit alternatives. Preserve original audio as the master playback clock and keep per-person motion start offsets. Skip a calibration frame only after detecting one. See [viewer.md](references/viewer.md) for recording and validation.
6. Integrate the ground-repair switch and animated GLB / original BVH / repaired BVH downloads. Read [grounding-and-export.md](references/grounding-and-export.md). Default Ground repair to continuous contact, as requested by the user; retain the Off option for jumps. Use the compact controls without long explanatory paragraphs. Bake the selected setting into the GLB; provide a separately baked repaired target-skeleton BVH and retain the original BVH unchanged. Verify representative/extreme poses, feet, camera framing, playback/seek/recording lifecycle and downloaded audio/video as available. Report what was actually checked; structural or mock checks are not browser encoding verification. Respect the active environment's browser-testing restrictions.
7. For a requested hosted webpage, use available Sites building/hosting skills and preserve an existing Site's audience; do not ship an old hosting manifest. If hosting is unavailable, deliver a runnable local viewer and explain the limitation. Return the actual verified URL, not a predicted one.

After API completion, query current balance again. Report actual billing only from a bill/usage record; an account balance delta can include concurrent activity. Never publish a previous user's video, BVH, account details, task IDs or signed asset URLs as template content.

## Server selection

Before remote calls, follow [CN/global routing](references/server-routing.md). Run scripts/v2fun.py region with the task project; normalize Bearer input, verify the selected server, and report its name and balance. Never infer the server from language or key appearance. Bind all quotes, task records and recovery to that server; a paid API failure never authorizes cross-server failover. Missing credentials do not block local work.
