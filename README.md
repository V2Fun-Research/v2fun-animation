<div align="center">

<a href="https://v2fun.ai/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg" />
    <img src="assets/logo.svg" width="250" height="100" alt="V2Fun" />
  </picture>
</a>

# V2Fun Animation

**Video-to-character animation with expressive cameras and local exports**

Capture motion, retarget a rigged character, refine the stage, and record with source audio.

[English](./README.md) | [简体中文](./README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version: 1.0.1](https://img.shields.io/badge/version-1.0.1-green.svg)](#roadmap)
[![Runtime: Three.js](https://img.shields.io/badge/runtime-Three.js-000000.svg)](https://threejs.org/)
[![Tooling: Python 3.9+ stdlib](https://img.shields.io/badge/tooling-Python%203.9%2B%20stdlib-3776AB.svg)](scripts)
[![Sponsor: V2Fun](https://img.shields.io/badge/Sponsor-V2Fun-16161A.svg)](https://v2fun.ai/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?logo=discord&logoColor=white)](https://discord.com/invite/2uBMRp275u)

</div>

---
## Live demos

No public hosted demonstration is included. Generate and open a local viewer using the workflow below.

## What it does

Animate a rigged GLB or FBX from a video or reuse an existing BVH. The standalone package includes the V2Fun API runtime, a Three.js viewer, body mapping and optional 30-joint finger mapping.

- Stage centering, fixed pitch/roll correction, and ground repair enabled by default.
- Cinematic, full-body, side and free views; describe a custom camera sequence in natural language.
- Local video recording with source audio; animated GLB and original/repaired BVH downloads.
- Compact English playback, adjustment and export controls.

PMX uses the native MMD route: submit the PMX archive plus BVH without conversion. Its paid executor and MMD viewer require adaptation; it is not a one-command scaffold path. The paid quote/retarget executor remains GLB-specific. Continuous contact can flatten jumps and is not foot locking/IK. Fixed tilt preserves dance bends. Custom camera text is interpreted by the agent, not an in-browser AI service. Capture gaps are disclosed rather than synthesized.

## How it works

**Video + rigged model → capture or reuse BVH → retarget → align → author cameras → preview and export**

1. Supply a video and optionally a rigged model. Without one, the access-restricted fallback model is used.
2. Choose body-only or body + fingers and a camera preset or free-text brief.
3. Review named API services, current pricing, estimated credits and balance before paid submissions.
4. Use compatible local retargeting or the authorized API route, retaining task IDs and budgets.
5. Inspect body/finger poses, centering, tilt, contacts and camera framing.
6. Record or export locally. Camera-only changes and model tests with existing BVH need no new capture.

See [camera preferences](references/camera-preferences.md), [alignment](references/alignment-and-layout.md) and [exports](references/grounding-and-export.md).

## Quick start

Requires Codex with local skills, Python 3.9+, Node.js and a WebGL browser. Three.js 0.180.0 is an external dependency for scaffolded viewers. No separate setup skill or Blender is required. This repository is private: installation requires an authorized GitHub account.

Install directly into `~/.codex/skills/v2fun-animation/`, or the `skills/v2fun-animation/` directory under a custom `CODEX_HOME`. `SKILL.md` must be directly inside that directory.

```sh
gh repo clone V2Fun-Research/v2fun-animation ~/.codex/skills/v2fun-animation
cd ~/.codex/skills/v2fun-animation
python3 scripts/v2fun.py doctor --project /tmp/v2fun-animation-project
python3 scripts/scaffold.py --help
```

Attach your inputs and use this example prompt:

```text
Use $v2fun-animation with my attached video and rigged model.
Capture body and fingers. Start wide, slowly push in, orbit left at 8 seconds,
and pull back at the end. Keep the feet visible. Show API services,
estimated credits and remaining balance before paid work.
```

The doctor command is offline and creates no API task. Configure `V2FUN_API_KEY` in the execution environment or an explicit project JSON configuration for authorized remote work; never commit credentials. Capture and API retargeting consume V2Fun credits; local preview, cameras and exports do not. The skill obtains a live quote instead of promising fixed prices.

Missing mappings require a reviewed adapter. An uncertain submission must be reconciled rather than automatically retried. See [runtime](references/runtime.md).

Updating from 1.0.0: remove the old vendor/v2fun-setup directory after installing the new files. Preserve external user projects, task IDs and budget records. The old scripts/setup.py command remains a compatibility alias; V2FUN_SETUP_DIR is no longer used. See [runtime migration](references/runtime.md#migration-from-the-nested-layout).

## What you get

| Output | Contents |
| --- | --- |
| English viewer | Playback, cameras, centering, tilt, ground repair and recording |
| Animated GLB | Mesh, materials, skin, skeleton and baked selected corrections |
| Original BVH | Unmodified source skeleton and capture units |
| Repaired BVH | Target skeleton in metres, alignment and continuous contact |
| Recorded video | Rendered character with source audio; MP4 or supported WebM |
| Project source | Local settings, camera brief and authored shot sequence |

Validate exports by reloading them. BVH contains no mesh or audio; GLB does not include source audio. Browser recording support varies.

## Roadmap

### v1.0.1

- [x] Flat scripts/references layout with integrated API setup, budgets and task recovery.
- [x] GLB/FBX local body/finger retargeting and model fallback.
- [x] Default-on grounding, stage centering, fixed tilt and side view.
- [x] Camera presets and agent-authored custom camera briefs.
- [x] Audio/video recording and GLB/BVH exports.
- [x] Bilingual installation and capability documentation.

## Star history

The repository is private; its chart may be unavailable to anonymous visitors.

[![Star History Chart](https://api.star-history.com/svg?repos=V2Fun-Research/v2fun-animation&type=Date)](https://www.star-history.com/#V2Fun-Research/v2fun-animation&Date)

## Sponsors

<table>
<tr><td align="center" width="160"><a href="https://v2fun.ai/"><img src="assets/sponsors/v2fun-square.png" width="96" height="96" alt="V2Fun" /></a><br><strong>V2Fun</strong></td><td>V2Fun supports this workflow by connecting video motion capture with a practical character animation preview. The skill brings the resulting motion into a local Three.js stage where creators can inspect poses, adjust placement and tilt, choose camera movement, and record with the source soundtrack. Its reusable infrastructure also keeps API credentials, task recovery and credit budgets separate from the viewer. Local retargeting and exports remain available without an additional paid capture when suitable motion already exists. This package documents the implemented animation workflow and its limitations; platform capabilities outside that workflow are not implied to be included.</td></tr>
</table>

Maintained by **V2Fun Team**. Feedback: [V2Fun Discord](https://discord.com/invite/2uBMRp275u)。

## Acknowledgments

Thanks to [Three.js](https://github.com/mrdoob/three.js) and its contributors for the rendering, loaders and exporters used by generated viewers. The optional MMD physics route uses [Ammo.js](https://github.com/kripken/ammo.js/). No endorsement is implied.

## License

[MIT License](LICENSE)<br>
Copyright © 2026 V2Fun Team.

MIT covers first-party code and documentation. The fallback model and brand assets are excluded; the fallback’s broader redistribution rights remain unverified. Keep this repository private until those rights are resolved or the asset is replaced. Service access and uploaded/generated asset rights are separate. See [third-party scope](THIRD_PARTY.md).
