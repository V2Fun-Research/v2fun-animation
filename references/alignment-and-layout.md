# Alignment and compact controls

The English starter supports GLB through GLTFLoader and FBX through FBXLoader, with body/finger world-rest retargeting. MMD uses its native PMX loader and Ammo physics; do not convert PMX for API input. The reusable alignment module can wrap an MMD adapter with explicit foot-bone names, a Hips target, and displayUnit. Keep presentation transforms outside physics and reset them before every base update.

## Defaults and calibration

- `alignment.placement: center`: translate the first captured hips position onto the stage origin in X/Z, preserving subsequent travel. `original` restores the input placement.
- `alignment.enabled: true`, `pitchDegrees: 0`, `rollDegrees: 0`: expose a tilt switch and numeric controls. Set fixed angles only after comparing several representative poses from the side/front. Do not flatten each frame into an upright pose or reuse model-specific 8°/9.5° values.
- `grounding.mode: continuous`: Ground repair starts on, as requested. Off preserves vertical movement after static first-frame floor alignment. Continuous contact may flatten jumps and is not foot locking or IK.
- Apply base retargeting/physics, fixed tilt around the hips, stage placement, static floor baseline, then optional continuous-contact height correction. Recompute the static baseline when tilt changes. Transforms must not accumulate during seeking or replay.

## Layout and exports

Keep the renderer and controls in separate layout rows. Group controls as playback/cameras, Adjust, and Export. Include Cinematic, Full body, Side view, and Free view. Use short labels, consistent control sizes and responsive wrapping. Remove the long alignment/export explanation paragraphs from the control panel. Keep capture-coverage information concise when there is a gap.

Place Animated GLB, Original BVH, and Repaired BVH together in the Export row. GLB bakes the selected alignment and grounding; repaired BVH bakes alignment plus continuous contact on the target skeleton in metres; original BVH remains byte-identical to the capture. Lock adjustment controls during recording and exports, then restore their previous states.

Verify beginning, representative bends/steps, and end; compare front/side views. Check no transform accumulation, finite bone transforms, stage position, actual finger variation, exported skin/animation, repaired BVH roundtrip, and desktop/mobile overflow. Do not package any test character, source video, BVH, task ID or billing record into this reusable template.
