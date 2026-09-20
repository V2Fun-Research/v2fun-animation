# Ground contact and asset export

## Repair policy

The included `grounding.js` implements an optional **continuous-contact trial**, not automatic foot locking or leg IK. For each pose it skins vertices influenced by a foot or its descendants (combined weight > 0.65), measures their world-space minimum Y, and offsets the character group so the lowest sampled sole reaches `floorY` (starter default -0.01, matching the platform top). Retargeting runs first on every update; offsets never accumulate. Off keeps the static first-frame alignment and preserves subsequent vertical motion.

This assumes at least one foot stays grounded. It may flatten real jumps, and it does not fix the second foot independently, horizontal sliding, knee direction, or rapid support-foot switches. Default `grounding.mode` to `continuous` per the user’s preference, with an accessible Off option. Review jumps against the video. Do not present a near-zero measured minimum as proof that the motion is physically correct. For jumps or uncertain contacts, retain original motion or implement contact intervals / IK as a separately validated improvement. Do not claim that continuous contact preserves jumps.

`animation.json` supports:

```json
{"grounding":{"mode":"continuous","floorY":-0.01,"footBones":{"Left":"mixamorigLeftFoot","Right":"mixamorigRightFoot"}}}
```

Exact bone-name overrides are optional for the default rig. Inspect custom rigs and map their actual foot bones; do not assume arbitrary naming is supported. Missing bones or usable skin vertices disables repair, while the original viewer and exports remain available. Validate additional skin influence sets before using the four-influence sampler. Floor geometry must match `floorY` in normalized viewer units.

Keep source BVH, original GLB, and original motion available. For requested comparisons, use identical cameras and time, display which side is corrected, and allow original playback. A ground-only change needs no V2Fun call or extra credits.

## Download contract

- **Export animated GLB**: bake the current target skeleton at 30 fps, including model/group normalization and the selected ground correction, into one animation clip. Include meshes, materials, skin weights and skeleton; omit stage, cameras, original video and audio. The result is an animated, rigged model, not just the bind-pose asset. The included baker samples node translation, quaternion and scale; it does not bake animated morph weights. Extend that path if a supplied clip uses animated morph targets.
- **Download original BVH**: download the selected motion's original capture BVH unchanged, with its source skeleton and units. It is **not** a BVH of the target skeleton and does **not** include the local ground correction. Say this in the UI. Do not claim automatic compatibility with a custom skeleton merely because both files can be downloaded.

- **Download repaired BVH**: bake the target bone hierarchy and continuous-contact repair at 30 fps, independently of the preview switch. Export Y-up coordinates in normalized viewer metres, with translation plus ZXY rotation channels at every joint to retain intermediate object transforms. This uses target bone names and proportions, so it is not a root-edited copy of the source BVH. It contains no mesh, materials or audio. Reject multiple disconnected roots, duplicate sanitized names, and mirrored/non-uniform bone scales rather than writing an invalid file. Consumers must support joint translation channels. Reimport with a BVH reader and compare world-space joints and rotations to the repaired target motion. A loop/padding of at most one output frame may occur from 30 fps duration rounding.

Keep the stage and control panel in separate layout rows, and keep the shot label inside the control row. Resize the Three.js renderer from the viewport element's measured size, including when the controls wrap; never use a fixed bottom offset that lets growing export controls cover the label.

`exports.js` manages the export controls; `animation-tools.js` uses Three.js `GLTFExporter`; scaffold vendors its module with the pinned Three.js package. Pause playback during GLB baking, restore pose/playback afterwards, block changes during recording, and show export failures. Names distinguish `character-aligned-off.glb` and `character-aligned-on.glb`.

## Validation

Sample the whole clip to detect non-finite transforms, residual penetration and unexpected height discontinuities. Reimport an exported GLB and confirm skin bindings, clip duration, node animation, and representative poses including the end. Compare the reimported corrected motion to the live correction; confirm the source BVH download is byte-identical to the selected input. Use numerical/file checks without browser interaction when environment restrictions apply. Report untested texture/morph/custom-rig cases accurately. Do not package user videos, BVH, project identifiers, API keys or job records into the reusable skill.

Placement and fixed tilt are applied before floor correction and are baked into both the animated GLB and repaired target BVH. Original BVH is always unchanged. See [alignment-and-layout.md](alignment-and-layout.md) for compact controls.
