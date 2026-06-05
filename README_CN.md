# Kiro Godot Accelerator

[English](README.md) | [繁體中文](README_TW.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> **语言说明：** Steering 文件（领域知识）以繁体中文撰写，顶部附英文摘要。Power 会以开发者偏好的语言回应。如遇语言障碍，欢迎提交 Issue 获取社区支持。

将你的 IDE 转变为 Godot Engine 开发 AI 助手。使用自然语言通过 MCP（Model Context Protocol）指挥 Godot Editor。本 Power 涵盖场景管理、GDScript 生成、资源管线、构建自动化、性能分析、代码质量检查、Shader 工作流程等功能 — 配备 16+ MCP 工具与 13 份领域知识文件。

> **核心概念：**
>
> • **MCP（Model Context Protocol）：** AI 助手与开发工具通信的标准化协议  
> • **Scene（场景）：** Godot 的基本构建单元 — 节点树存为可复用文件（.tscn）  
> • **Node（节点）：** 场景树的基本单位；Godot 中一切皆继承 Node  
> • **Signal（信号）：** 实现观察者模式的解耦节点通信机制  
> • **GDScript：** Godot 内置脚本语言，具 Python 风格语法与静态类型支持  
> • **Resource（资源）：** Godot 从磁盘存取的所有数据（.tres、纹理、音频等）

## 功能特色

- **场景管理** — 创建、修改、保存场景；从 6 个脚手架模板生成完整场景结构
- **GDScript 生成** — 类型安全脚本，含信号、导出变量、状态机、组件模式
- **资源管线** — 导入预设、未使用资源检测、引用验证、格式优化
- **构建自动化** — 多平台导出（Windows/macOS/Linux/Web/Android/iOS），headless CLI 构建
- **性能分析** — 12 项反模式检测、帧预算分析、内存分析
- **代码质量** — 命名规范强制、信号耦合度分析、循环依赖检测
- **Shader 工作流** — 文本 & VisualShader 模板、平台兼容性验证
- **TileMap 工具** — TileSet 配置、Terrain sets、物理/导航层
- **动画系统** — AnimationTree 状态机、BlendTree 配置、Tween 模式
- **UI 系统** — Control 层级架构、Theme 生成、响应式布局、无障碍设计
- **Signal 架构** — Event Bus 模式、耦合度图表、解耦通信
- **多人联网** — RPC 模式、MultiplayerSpawner/Synchronizer、专用服务器设置

## 架构

```
开发者（自然语言）
    → AI 层（意图理解与规划）
        → MCP 协议
            → Godot Editor（执行层）

Godot Accelerator（智能层）
├── POWER.md        → 定义工具与工作流的主文件
├── steering/       → 13 份领域知识文件
├── templates/      → 30+ JSON 模板（7 大类）
└── src/            → 12 个 TypeScript 分析模块
```

## 前置需求

- [Godot Engine 4.3+](https://godotengine.org/download/)（建议 4.4+ 以支持 UID）
- [Kiro IDE](https://kiro.dev/docs/getting-started/installation)
- [Node.js 18+](https://nodejs.org/) 与 npm
- [godot-mcp](https://github.com/bradypp/godot-mcp) 已 clone 并 build

## 安装步骤

### 步骤 1 — 在 Kiro 安装此 Power

打开 Kiro → 左侧面板点击 Powers 图标 → 点击「+」→ 选择「Add Custom Power」→ 选择本项目根目录

### 步骤 2 — 安装并构建 godot-mcp

```bash
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp
npm install
npm run build
```

### 步骤 3 — 配置 MCP 连接

编辑 `mcp.json` 或 `.kiro/settings/mcp.json`：

**Windows：**
```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\<你的用户名>\\path\\to\\godot-mcp\\build\\index.js"],
      "env": {
        "GODOT_PATH": "C:\\Program Files\\Godot\\Godot_v4.4-stable_win64.exe",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

**macOS / Linux：**
```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/Users/<YOU>/path/to/godot-mcp/build/index.js"],
      "env": {
        "GODOT_PATH": "/Applications/Godot.app/Contents/MacOS/Godot",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

### 步骤 4 — 安装自动引导 Hook（推荐）

```bash
mkdir -p .kiro/hooks
cp hooks/pre-godot-tool.kiro.hook .kiro/hooks/
```

### 验证连接

在 Kiro 中输入任何 Godot 相关命令（如「显示当前安装的 Godot 版本」）。如果 AI 正确回应，连接即成功。

## 使用方式

安装完成后，直接用自然语言跟 Kiro 对话。AI 会自动启用 Power、选择正确的 MCP 工具并执行操作。

### 你可以这样问

| 领域 | 示例命令 |
|------|----------|
| 场景 | 「创建一个 2D 平台游戏场景」、「帮我建一个主菜单 UI」 |
| GDScript | 「生成一个含状态机的玩家控制器」、「创建 Event Bus 单例」 |
| 资源 | 「检查未使用的资源」、「设置像素风格导入预设」 |
| 性能 | 「扫描性能反模式」、「生成优化报告」 |
| 质量 | 「检查命名规范」、「分析信号耦合度」 |
| Shader | 「创建精灵外框 Shader」、「做一个溶解特效」 |
| 构建 | 「导出 Windows 版本」、「构建 Web 版」 |
| 平台 | 「我的项目兼容 iOS 吗？」、「检查移动端内存预算」 |
| TileMap | 「设置带 Terrain 自动拼接的 TileSet」 |
| 动画 | 「创建 Idle/Run/Jump 状态机」 |
| 多人 | 「设置 ENet 多人联网」 |

### 示例工作流：构建 2D 平台游戏

```
1. "创建一个新的 2D 平台游戏场景，包含 TileMap 地形、玩家和摄像机"

2. "生成带移动、跳跃、coyote time 和动画状态的玩家控制器"

3. "为玩家创建状态机：Idle、Run、Jump、Fall 状态及正确的转换"

4. "给玩家添加生命值组件，包含伤害、治疗和无敌帧"

5. "设置 Event Bus 全局信号：player_died、score_changed、level_completed"

6. "扫描所有脚本的性能反模式和命名规范违规"

7. "导出 Web 和 Windows 版本"
```

## 开发

```bash
npm install
npm test              # 运行所有测试
npm run test:unit     # 仅单元测试
npm run test:property # 属性测试 (fast-check)
npm run test:coverage # 测试覆盖率
npm run lint          # ESLint 检查
npx tsc --noEmit     # TypeScript 类型检查
```

## 官方 Godot 文档参考

| 领域 | 官方文档链接 |
|------|-------------|
| GDScript 风格 | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html |
| 静态类型 | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html |
| 场景组织 | https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html |
| 信号系统 | https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html |
| 性能最佳实践 | https://docs.godotengine.org/en/stable/tutorials/performance/index.html |
| 导出项目 | https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html |
| Shader | https://docs.godotengine.org/en/stable/tutorials/shaders/index.html |
| AnimationTree | https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html |
| TileMap | https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html |
| 多人联网 | https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html |
| UI/Control | https://docs.godotengine.org/en/stable/tutorials/ui/index.html |
| 资源导入 | https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html |
| 项目组织 | https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html |
| 命令行参考 | https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html |

## 疑难排解

| 问题 | 解决方案 |
|------|----------|
| 「找不到 Godot 可执行文件」 | 在 mcp.json 设置 `GODOT_PATH` 环境变量 |
| MCP 工具无响应 | 确认 godot-mcp 已 build（`npm run build`），路径正确 |
| 「无效的项目路径」 | 提供包含 `project.godot` 的绝对路径 |
| UID 工具无法使用 | 需要 Godot 4.4+；更早版本使用 `res://` 路径 |

## 安全

参见 [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) 了解安全问题报告方式。

## 许可证

MIT License。详见 [LICENSE](LICENSE) 文件。
