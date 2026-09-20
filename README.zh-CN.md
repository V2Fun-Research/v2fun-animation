<div align="center">

<a href="https://v2fun.ai/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg" />
    <img src="assets/logo.svg" width="250" height="100" alt="V2Fun" />
  </picture>
</a>

# V2Fun Animation

**从视频到角色动画，支持自定义运镜与本地导出**

提取动作、迁移到绑定角色、调整舞台，并录制带原视频声音的动画。

[English](./README.md) | [简体中文](./README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version: 1.1.0](https://img.shields.io/badge/version-1.1.0-green.svg)](#roadmap)
[![Runtime: Three.js](https://img.shields.io/badge/runtime-Three.js-000000.svg)](https://threejs.org/)
[![Tooling: Python 3.9+ stdlib](https://img.shields.io/badge/tooling-Python%203.9%2B%20stdlib-3776AB.svg)](scripts)
[![Sponsor: V2Fun](https://img.shields.io/badge/Sponsor-V2Fun-16161A.svg)](https://v2fun.ai/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?logo=discord&logoColor=white)](https://discord.com/invite/2uBMRp275u)

</div>

---
## Live demos

| 示例 | 描述 | 查看 |
| --- | --- | --- |
| 角色动画 | 已有视频驱动角色动画与本地查看器 | [查看](example/index.html) |

## What it does

从视频驱动已绑定的 GLB 或 FBX，也可复用现有 BVH。独立技能包内置 V2Fun API 基建、Three.js 查看器、身体映射和可选的 30 个手指关节映射。

- 舞台居中、固定前后／左右倾斜校正，贴地修复默认开启。
- 动感、全身、侧面和自由视角；支持自然语言描述自定义运镜。
- 录制带原视频声音的画面，下载动画 GLB、原始和修复后 BVH。
- 简洁的英文播放、调整和导出控制区。

PMX 走原生 MMD 路线：直接提交 PMX 压缩包和 BVH，不转格式；付费执行器与 MMD 查看器仍需适配，并非一键初始化路径。付费报价／重定向脚本目前仍面向 GLB。持续贴地可能压平跳跃，不是脚部锁定或 IK。固定倾斜校正保留舞蹈弯腰动作。自定义运镜由代理理解编排，不是浏览器内置 AI 服务。动捕缺失区间会明确标注，不会伪造补齐。

## How it works

**视频＋绑定模型 → 动捕或复用 BVH → 重定向 → 校正 → 编排运镜 → 预览与导出**

1. 提供视频及可选的绑定模型；未提供模型时使用限制访问的默认素材。
2. 选择仅身体或身体＋手指，并选择预设或输入运镜描述。
3. 付费提交前查看调用服务、实时价格、预计积分和余额。
4. 使用兼容的本地重定向或已授权 API 路线，保留任务 ID 与预算。
5. 检查身体／手指姿态、居中、倾斜、地面接触和镜头构图。
6. 本地录制或导出。仅改运镜、复用 BVH 测试模型不需重新动捕。

详见 [运镜偏好](references/camera-preferences.md)、[校正](references/alignment-and-layout.md) 和 [导出](references/grounding-and-export.md)。

## Quick start

已内置国内服／海外服识别。远程操作前运行 `python3 scripts/v2fun.py region --project /path/to/project`；可通过 `V2FUN_REGION=cn` 或 `V2FUN_REGION=global` 明确选择。自动识别仅查询余额，报价和已有任务始终绑定对应服务器。详见[服务器选择](references/server-routing.md)。

需要支持本地技能的 Codex、Python 3.9+、Node.js 和 WebGL 浏览器。初始化网页使用外部 Three.js 0.180.0 依赖，无需另装 setup 技能或 Blender。仓库为私有，安装需要有权限的 GitHub 账户。

直接安装到 `~/.codex/skills/v2fun-animation/`，或自定义 `CODEX_HOME` 下的 `skills/v2fun-animation/`；`SKILL.md` 必须直接位于该目录。

```sh
gh repo clone V2Fun-Research/v2fun-animation ~/.codex/skills/v2fun-animation
cd ~/.codex/skills/v2fun-animation
python3 scripts/v2fun.py doctor --project /tmp/v2fun-animation-project
python3 scripts/scaffold.py --help
```

上传素材后可使用以下提示词，也可用中文描述相同需求：

```text
Use $v2fun-animation with my attached video and rigged model.
Capture body and fingers. Start wide, slowly push in, orbit left at 8 seconds,
and pull back at the end. Keep the feet visible. Show API services,
estimated credits and remaining balance before paid work.
```

Doctor 命令只做离线检查，不创建 API 任务。远程工作通过执行环境的 `V2FUN_API_KEY` 或明确指定的项目 JSON 配置认证，不要提交凭据。动捕和 API 重定向消耗 V2Fun 积分；本地预览、运镜及导出不消耗积分。技能读取实时报价，不承诺固定价格。

缺失骨骼映射需检查并适配；不确定是否提交成功时应核实原任务，不自动重试。详见 [运行说明](references/runtime.md)。

从 1.0.0 更新：安装新文件后移除旧的 vendor/v2fun-setup 目录；保留外部用户项目、任务 ID 和预算记录。旧 scripts/setup.py 命令仍作为兼容入口；不再使用 V2FUN_SETUP_DIR。详见 [迁移说明](references/runtime.md#migration-from-the-nested-layout)。

## What you get

| 交付物 | 内容 |
| --- | --- |
| 英文网页 | 播放、运镜、居中、倾斜、贴地与录制 |
| 动画 GLB | 网格、材质、蒙皮、骨架及所选校正的烘焙动画 |
| 原始 BVH | 未修改的源骨架和动捕单位 |
| 修复后 BVH | 米制目标骨架，包含校正和持续贴地 |
| 录制视频 | 角色画面和原音频，MP4 或支持的 WebM |
| 项目源码 | 本地设置、用户运镜描述及编排后的镜头序列 |

导出后需重新加载验证。BVH 不含网格和声音，GLB 不含原视频音频。录制能力取决于浏览器。

## Roadmap

### v1.1.0

- [x] 采用扁平 scripts/references 结构，整合 API 基建、预算及任务恢复。
- [x] GLB／FBX 本地身体和手指重定向及默认模型。
- [x] 默认贴地、舞台居中、固定倾斜校正和侧视。
- [x] 运镜预设及代理编排的自定义运镜。
- [x] 音视频录制和 GLB／BVH 导出。
- [x] 中英双语安装与能力说明。

## Star history

仓库为私有，匿名访问者可能无法查看图表。

[![Star History Chart](https://api.star-history.com/svg?repos=V2Fun-Research/v2fun-animation&type=Date)](https://www.star-history.com/#V2Fun-Research/v2fun-animation&Date)

## Sponsors

<table>
<tr><td align="center" width="160"><a href="https://v2fun.ai/"><img src="assets/sponsors/v2fun-square.png" width="96" height="96" alt="V2Fun" /></a><br><strong>V2Fun</strong></td><td>V2Fun 支持从视频动捕到角色动画预览的创作流程。技能将动作带入本地 Three.js 舞台，方便创作者检查姿态、调整位置与倾斜、选择运镜，并录制带原音轨的视频。可复用基建将 API 凭据、任务恢复和积分预算与网页分离。已有合适动作时，可继续本地重定向和导出，无需额外付费动捕。本项目只说明已经实现的动画工作流及其边界，不意味着平台的其他能力也全部包含在技能中。</td></tr>
</table>

维护团队：**V2Fun Team**。反馈：[V2Fun Discord](https://discord.com/invite/2uBMRp275u)。

## Acknowledgments

感谢 [Three.js](https://github.com/mrdoob/three.js) 及其贡献者提供查看器所使用的渲染、加载器和导出工具。可选的 MMD 物理路线使用 [Ammo.js](https://github.com/kripken/ammo.js/)。不代表相关项目对本技能背书。

## License

[MIT License](LICENSE)<br>
Copyright © 2026 V2Fun Team.

MIT 适用于第一方代码与文档，不包含默认模型和品牌素材。默认模型的进一步分发权尚未核实；在解决权利或替换素材前保持仓库私有。服务访问、上传与生成素材权利另行适用对应条件。详见 [第三方范围](THIRD_PARTY.md)。
