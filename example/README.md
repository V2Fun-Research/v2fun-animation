# V2Fun Animation example

Open `index.html` in a current desktop Chrome or Edge browser and click **Play**. No server, installation, API key or network connection is required. The single HTML file embeds Three.js, the default rigged GLB, captured motion, and the supplied video with its original audio.

- Source: `198749558-1-208.mp4`, 22.395 seconds.
- Body and hand capture; 52 mapped joints including 30 animated finger joints.
- Cinematic: 10 dance-MV shots with audio-accent cuts, low/high orbits, push-ins, subtle beat pulses and a closing pullback. Full body, Side view and Free view remain available.
- Stage centering, pitch/roll controls and ground repair (on by default).
- **Record video** starts/stops a local download with source audio. The browser chooses its supported recording format.
- **Animated GLB**, **Original BVH**, and **Repaired BVH** downloads.

Motion playback is scaled to the returned capture timing (about 22.42 seconds); the original BVH download retains the original frame timing and bytes. Repaired BVH uses the target skeleton in metres. Continuous ground contact can flatten jumps; switch Ground repair off when reviewing airborne movement.

Verified locally in desktop Chrome: offline file opening with zero external requests, finger variation, finite poses, continuous ground contact, narrow-screen layout, exports, and a short recording containing H.264 video and audible AAC audio. Other browsers may differ in recording support.

Three.js and fflate license notices are included. Media and character assets are user-supplied; the dependency licenses do not grant rights to those assets.

## 中文使用说明

双击 `index.html`，在 Chrome 或 Edge 中点击 Play 即可离线查看，无需安装或填写 API 密钥。模型、动作、视频、原声与网页依赖均已打包在 HTML 内。

支持切换运镜、默认接地修复、倾斜调整、带声音录制，以及下载绑定动作的 GLB、原始 BVH 和修复后 BVH。连续接地可能压平跳跃，可随时关闭。原始 BVH 保持服务返回内容不变。
