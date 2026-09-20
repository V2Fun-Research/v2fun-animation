# Default avatar

`assets/default.glb` is derived from the model supplied by the user in this task. The user explicitly requested bundling it as the fallback model. This does not establish broader third-party licensing rights; don't publish the reusable asset publicly without the user's requested publication scope and a rights review.

Preparation uses Three.js GLTFLoader, Skeleton.pose() and GLTFExporter. The bundled result has zero animation clips, two skinned meshes, 65 bones, and preserves its material/geometry/skin data. The original source file remains untouched. Mesh names: Alpha_Joints and Alpha_Surface; humanoid bone names use the Mixamo convention. Finger joints are present, so it can accept hand animation after verified retargeting.

The starter uses this asset only if the user does not provide their own rigged GLB or FBX. Retain the name default.glb inside the skill. Scaffold copies the chosen model to the project's standard avatar.glb path. The default is a neutral bind-pose model, not a prerecorded dance and not a synthetic substitute for requested motion capture.

The model is excluded from the repository’s MIT code/documentation license. Its third-party redistribution rights have not been established; the initial repository is access-restricted. Do not change repository visibility or redistribute the asset publicly without resolving those rights.
