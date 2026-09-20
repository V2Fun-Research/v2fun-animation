# English viewer and animation integration

Create a project without overwriting an existing viewer:

```sh
python3 <skill>/scripts/scaffold.py --project <project> --video <video.mp4> --three-dir <installed-three-package-dir>
# Optional --model <rigged.glb>; absent means assets/default.glb.
# Optional --camera-style clear|mv|auto; default auto.
```

Run `node serve.cjs` from that project to preview. The server supports byte ranges, which are necessary for reliable video seeking. Do not use a server without range support for synchronization checks. It serves only dist. Hosting uses dist as the static directory.

`dist/animation.json` controls grounding (mode, floorY, optional exact Left/Right footBones names), cameraPreference (clear/mv/auto), video/model paths, duration, motionMeta, selected motionIndex, hands, optional animatedModel, optional bone mapping, and calibration frame offset. The starter contains no input video, BVH, task response, hosting identity or account credentials. Capture downloads populate missing motion assets; an incomplete starter is not a delivered animation.

## Retargeting

For the included default, the BVH adapter restores bind pose and transfers source current world rotation × inverse(source rest world rotation) × target rest world rotation, converting back via inverse(target parent world rotation). Traverse parents first. Scale root translation by measured leg length, not a saved account example. A local foot-height estimate is an approximation; preserve jumps and disclose residual sliding.

Inspect a new skeleton's names/hierarchy and provide a mapping in animation.json or adapt the code. Check skins and influence sets, target bind matrices, units, rest pose and forward axis. More than four influences require merging by bone and renormalizing; don't drop an entire weight set silently. Mapping missing mandatory joints raises an error. Root transforms may require a new normalization adapter.

An all-identity first frame is considered a candidate calibration frame; verify visually and set `frameOffsetSeconds` explicitly when needed. If no calibration frame exists, use zero. Source timing uses metadata.motion_start_time_seconds. The video/audio currentTime is the primary clock. Retain a final pose only for a short uncovered tail and disclose material capture gaps.

The local adapter accepts GLB and FBX, normalizes source bone lookup to lowercase, and maps Mixamo body bones plus 30 finger joints when hands are requested. Missing mappings raise an error. Set `handMappingVerified: true` only after checking channel variation and visual results.

For API-retargeted GLBs, the alternate loader plays their real AnimationClip, finds the hips, and normalizes the model. The starter checks for named finger tracks on hands requests, but this is only an early guard. Inspect channel variation, actual mapped joints and visible finger motion; constant/empty or unmapped tracks do not prove hands work. Select a clip explicitly if the API returns several unrelated clips. No automatic facial motion is promised.

## Cameras and recording

Select a style using [camera-preferences.md](camera-preferences.md). Clear movement starts in Full body; Stage MV uses eight shots; Choose for me starts with three gentle, continuous full-body shots. Each sequence scales to media duration. These are authored starting presets, not automatic choreography analysis. Adapt shot boundaries to action extremes; do not call fixed shot timings beat-detected. Keep hands/head/feet in frame where a shot promises full-body coverage. Include Full body and Free view modes and a collapsible source video.

Record video restarts playback, captures the WebGL canvas at 30 fps and routes the source video's audio through a reused Web Audio node to a cloned recording track. No microphone is requested. Buttons/seek that would break time are disabled while recording. Stop or video end builds a Blob, triggers a local download and leaves a Download again link. Prefer supported MP4, otherwise WebM. Keep the tab foreground. The HTML UI/reference video are excluded from the recording. Resize/rotation can change captured dimensions, so avoid those while recording; a fixed offscreen recording canvas is an optional follow-up when required.

Unsupported browsers show Recording unavailable. A silent source has no music to invent: explain this before claiming an audible export. Autoplay/context failures must restore controls and report an error. Stop cloned tracks only; preserve the reusable audio source for repeat recordings. Don't revoke a download URL immediately after clicking it.

## Verification

Check beginning, quarters, end, and action extremes; original video vs target body/hand motion; no NaN transforms; skin weight sums; floor contact; camera clipping; mobile control wrapping. For an actual recorded output, decode it and check duration, video frames and non-silent source audio when available. Lifecycle mock tests verify control/track management, not codec quality. Respect environment-specific permission and browser-testing rules, reporting unperformed checks honestly. After pure English-string edits, syntax checks and lifecycle checks are usually sufficient; do not make a new paid capture just to test the skill.

## Ground repair and asset downloads

Read [grounding-and-export.md](grounding-and-export.md). The starter includes the optional ground-height correction and an exporter for a rigged, animated GLB plus separate original and repaired BVH downloads. These are local operations and do not submit an API task.

Read [alignment-and-layout.md](alignment-and-layout.md) for stage centering, fixed tilt, default-on grounding and compact controls. Use existing BVH metadata via motionMeta/motionIndex; do not recapture or call paid retargeting simply to test another compatible model. The paid quote executor remains GLB-specific.
