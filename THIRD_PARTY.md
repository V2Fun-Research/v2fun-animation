# Licenses and asset scope

The MIT license applies to the first-party code and documentation, including the integrated V2Fun setup helpers (V2Fun Team). It does not grant rights to uploaded models, videos, API results or brand marks.

| Component | Included? | License / source |
| --- | --- | --- |
| V2Fun setup 1.0.0 | Yes, integrated into scripts/ and references/ | First-party code under this repository's MIT license |
| Three.js 0.180.0 | External; scaffold copies selected modules into a user project | MIT; https://github.com/mrdoob/three.js/tree/r180. The scaffold copies the upstream LICENSE. |
| fflate in Three.js FBXLoader dependencies | External; copied from the selected Three.js distribution | MIT; preserve its module license header. |
| Ammo.js / Bullet | Not bundled; needed for a separately adapted MMD viewer | zlib; https://github.com/kripken/ammo.js/. Review the actual binary/distribution before shipping. |
| Python, Node.js, browser | External runtimes, not bundled | Their respective upstream licenses |
| Playwright / FFmpeg | Validation tooling only, not bundled | Not required by the installed skill; use independently licensed installations |
| V2Fun logos | Included for V2Fun identification | Brand assets; no trademark rights granted |
| assets/default.glb | Included in the access-restricted package | User-provided fallback; NOT MIT. Broader redistribution rights are unverified. See references/default-asset.md. |

The fallback has zero animation clips, two skinned meshes and 65 bones. This technical preparation does not establish ownership or redistribution rights. The repository must remain private until the model's rights are resolved or a redistributable replacement is supplied. User test FBX/PMX models, source videos, BVH captures and account/task records are not part of the skill.

V2Fun API access and credits are separate from software licensing. Users supply their own service credentials and must have rights to process their submitted assets. No service access or third-party endorsement is granted by this package.
