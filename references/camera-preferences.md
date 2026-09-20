# Camera preference and preview feedback

Ask about the intended viewing experience, not camera engineering. Reuse an existing brief. For a missing preference, offer presets plus a free-text option in the user's language:

| Choice | Config | Starting behavior |
| --- | --- | --- |
| Clear movement | clear | Stable full-body view; prioritize readable arms, feet and travel |
| Stage MV | mv | Eight-shot cinematic starting sequence with push-ins, orbits and varied shot sizes |
| Describe my own | custom | Preserve the user’s description and author a shot sequence for this clip |
| Choose for me | auto | Three gentle continuous full-body shots, no roll; review the actions before adding stronger moves |

The default is `auto`, not an obligation to ask another question. If a user skips the optional preference or says they don't know, explain the default and proceed. Don't delay authorized capture for an aesthetic answer. The separate hand-capture and spending decisions retain their existing requirements.

## Adapt after viewing the clip

- Wide arm gestures, kicks and jumps: widen the shot; preserve head, hands and feet in promised full-body shots.
- Smaller movements and settled poses: a moderate push-in can provide variation without hiding the action.
- Turns and lateral travel: modest orbit or follow, avoiding competing motion and abrupt reversals.
- Opening: establish the character and stage. Ending: ease down and settle.
- Avoid frequent cuts, large rolls and aimless complete circles by default. Respect an explicit request for a stronger style.
- Use actual event times to place emphasis. Do not label proportional preset timings as beat detection or motion-aware automation.

Record the preference in animation.json and retain a short camera note beside project source with any concrete time ranges that were adjusted. No extra document is necessary for an unchanged preset. Allow an explicit custom brief to override presets; preserve the chosen brief in that note.

## Preview first, then ask one useful refinement

Keep Cinematic, Full body, Side view and Free view controls. Show the actual playable result instead of asking a long questionnaire. When the user requests refinement or is still unsure, ask: “Would you prefer steadier cameras, closer framing, or more energy?” Don't require feedback or approval to finish a satisfactory first version.

| Feedback | Concrete revision |
| --- | --- |
| Too shaky | Reduce orbit angle, roll and cut frequency; lengthen holds |
| Cannot see the movement | Increase full-body coverage and limb margins; remove obstructive close-ups |
| More energy | Add short pushes and shot-size changes at observed action accents |
| Character too far away | Reduce distance during small movements; retain wide framing for limb extremes |
| Emphasize hands | Use close-ups only where hands are visible and transferred finger motion was validated |

Camera changes are local Three.js work. Reuse the existing animation, source audio and task records. Do not rerun motion capture, change turbo/pro, or spend additional V2Fun credits for camera-only feedback. If the user also changes the source clip or requests new hand capture, handle that separately with a revised API plan.

## Custom camera descriptions

Invite a description such as: “Start with a wide shot, slowly push closer, orbit to the left at 8 seconds, and pull back for the ending. Keep the feet visible and avoid roll.” Accept Chinese or English, short style references, shot-by-shot directions and explicit constraints. A custom brief takes precedence over a preset. If the brief is vague, infer moderate movement and explain the interpretation; ask one short clarification only for a consequential conflict or missing requirement.

Preserve the user's original words in `animation.json.cameraBrief`. Set `cameraPreference: custom`. Translate the request into concrete timings after inspecting the actual motion, saving `cameraShots` as a list of `{t, end, name, a, b}`. Times are source-video seconds, starting at zero with contiguous intervals. Each endpoint is `[orbitAngleRadians, cameraHeight, distance, lookAtHeight, fovDegrees, rollRadians]` in normalized viewer units. Endpoints interpolate smoothly within each shot; match adjacent endpoints for continuous moves or use different endpoints only for intentional cuts. A shot list is relative to the character root and targets its vertical axis; unusual framing, multi-character blocking or spline paths require extending the renderer rather than claiming the six-value format can express them.

Use `scaffold.py --camera-brief "USER DESCRIPTION"` to save the brief, optionally adding `--camera-shots shots.json` after authoring. A brief without shots deliberately displays a pending notice with gentle preview cameras; the browser does not interpret natural language. Finish authoring and viewing the shots, then set `cameraBriefStatus: reviewed`. Do not report the custom camera as complete while it is pending. The last shot holds at its endpoint after the sequence ends. Align the shot sequence to valid captured motion and disclose coverage gaps.

Keep the conversation simple: “Choose a preset, or describe the camera movement you want—for example, start wide, slowly push in, orbit left, then pull back.” Do not require users to supply JSON or camera coordinates. The web viewer remains a playback tool; this feature adds natural-language intake through the skill conversation, not an in-browser AI camera generator.
