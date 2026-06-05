# Kiro Godot Accelerator

[English](README.md) | [繁體中文](README_TW.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> **Note on language availability:** README files are available in 5 languages to support our global community.
> Steering files (domain knowledge) are in Traditional Chinese with English summary
> sections. The Power responds in the developer's preferred language. If you
> encounter any language barriers, please open an issue for community support.

Transform your IDE into a Godot Engine development AI assistant. Use natural language to command Godot Editor via MCP (Model Context Protocol). This Power covers scene management, GDScript generation, asset pipeline, build automation, performance analysis, code quality checks, shader workflows, and more — with 16+ MCP tools and 13 domain knowledge files.

> **Key Concepts:**
>
> • **MCP (Model Context Protocol):** A standardized protocol for AI assistants to communicate with development tools  
> • **Scene:** Godot's fundamental building block — a tree of Nodes saved as a reusable file (.tscn)  
> • **Node:** The base unit of the scene tree; everything in Godot extends Node  
> • **Signal:** Observer pattern implementation for decoupled node communication  
> • **GDScript:** Godot's built-in scripting language with Python-like syntax and static typing support  
> • **Resource:** Any data Godot saves/loads from disk (.tres, textures, audio, etc.)

## Features

- **Scene Management** — Create, modify, save scenes; generate complete scene structures from 6 scaffold templates
- **GDScript Generation** — Type-safe scripts with signals, exports, state machines, component patterns
- **Asset Pipeline** — Import presets, unused asset detection, reference validation, format optimization
- **Build Automation** — Multi-platform exports (Windows/macOS/Linux/Web/Android/iOS), headless CLI builds
- **Performance Analysis** — 12 anti-pattern detections, frame budget analysis, memory profiling
- **Code Quality** — Naming convention enforcement, signal coupling analysis, circular dependency detection
- **Shader Workflow** — Text & VisualShader templates, platform compatibility validation
- **TileMap Tooling** — TileSet configuration, terrain sets, physics/navigation layers
- **Animation System** — AnimationTree state machines, BlendTree configuration, Tween patterns
- **UI System** — Control hierarchies, Theme generation, responsive layouts, accessibility
- **Signal Architecture** — Event Bus patterns, coupling graphs, decoupled communication
- **Multiplayer** — RPC patterns, MultiplayerSpawner/Synchronizer, dedicated server setup

## Architecture

```
Developer (Natural Language)
    → AI Layer (Intent Understanding & Planning)
        → MCP Protocol
            → Godot Editor (Execution Layer)

Godot Accelerator (Intelligence Layer)
├── POWER.md        → Main document defining tools & workflows
├── steering/       → 13 domain knowledge files
├── templates/      → 30+ JSON templates (7 categories)
└── src/            → 12 TypeScript analysis modules
```

## Prerequisites

- [Godot Engine 4.3+](https://godotengine.org/download/) installed (4.4+ recommended for UID support)
- [Kiro IDE](https://kiro.dev/docs/getting-started/installation) installed
- [Node.js 18+](https://nodejs.org/) and npm (for godot-mcp server)
- [godot-mcp](https://github.com/bradypp/godot-mcp) cloned and built

## Installation

### Step 1 — Install this Power in Kiro

Open Kiro → Left panel click Powers icon → Click "+" → Select "Add Custom Power" → Select this project's root directory

### Step 2 — Install and Build godot-mcp

```bash
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp
npm install
npm run build
```

### Step 3 — Configure MCP Connection

Edit `mcp.json` or `.kiro/settings/mcp.json`:

**Windows:**
```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\<YOU>\\path\\to\\godot-mcp\\build\\index.js"],
      "env": {
        "GODOT_PATH": "C:\\Program Files\\Godot\\Godot_v4.4-stable_win64.exe",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

**macOS / Linux:**
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

> **GODOT_PATH:** Set this to your Godot executable. If Godot is in your system PATH, you can omit this variable (auto-detection will try common locations).

### Step 4 — Install Auto-Guidance Hook (Recommended)

```bash
mkdir -p .kiro/hooks
cp hooks/pre-godot-tool.kiro.hook .kiro/hooks/
```

This ensures the AI automatically activates the Power and uses the correct steering files on every prompt.

### Verify Connection

Type any Godot-related command in Kiro:
```
Show me the Godot version installed on my system
```
If the AI responds with version info, the connection is successful.

## Usage

Once installed, talk to Kiro in natural language. The AI will automatically select the right MCP tools and steering files.

### Getting Started

1. Check setup:
```
What Godot version is installed? Show my project info.
```

2. Create a scene:
```
Create a 2D platformer scene with a player (CharacterBody2D), TileMap terrain, and a Camera2D
```

3. Generate a script:
```
Create a player controller script with WASD movement, jumping with coyote time, and gravity
```

4. Build:
```
Export my project for Web (HTML5)
```

### What Can You Ask?

| Domain | Example Commands |
|--------|-----------------|
| Scene | "Create a new 3D FPS scene", "Add a Sprite2D node to the player", "Set up a main menu with buttons" |
| GDScript | "Create a state machine for the player", "Generate an Event Bus autoload", "Add a health component with signals" |
| Assets | "Check for unused assets", "Set up pixel art import presets", "Validate all resource references" |
| Performance | "Scan for performance anti-patterns", "Check _process budget usage", "Generate optimization report" |
| Quality | "Check naming conventions", "Analyze signal coupling", "Find circular dependencies" |
| Shaders | "Create a sprite outline shader", "Make a dissolve effect", "Check shader platform compatibility" |
| Build | "Export for Windows release", "Build for Android", "Set up CI/CD export pipeline" |
| Platform | "Is my project compatible with Web?", "Check memory budget for mobile", "What features are unsupported on iOS?" |
| TileMap | "Set up a TileSet with terrain auto-tiling", "Configure physics layers for one-way platforms" |
| Animation | "Create a state machine with Idle/Run/Jump states", "Set up a BlendSpace1D for walk-run blending" |
| Multiplayer | "Set up ENet multiplayer with RPC", "Create a MultiplayerSpawner for players" |

### Example Workflow: Build a 2D Platformer

```
1. "Create a new 2D platformer scene with TileMap terrain, player, and camera"

2. "Generate a player controller with movement, jump, coyote time, and animation states"

3. "Create a state machine for the player: Idle, Run, Jump, Fall states with proper transitions"

4. "Add a health component to the player with damage, heal, and invincibility frames"

5. "Set up an Event Bus for global signals: player_died, score_changed, level_completed"

6. "Scan all scripts for performance anti-patterns and naming convention violations"

7. "Export for Web and Windows"
```

## Development

```bash
npm install
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:property # Property tests (fast-check)
npm run test:coverage # Tests with coverage
npm run lint          # ESLint check
npx tsc --noEmit     # TypeScript type checking
```

## Project Structure

```
kiro-godot-accelerator/
├── POWER.md                    # Main document for the AI assistant
├── mcp.json                    # MCP Server connection config
├── steering/                   # Domain knowledge Steering Files (13)
│   ├── gdscript-patterns.md
│   ├── scene-architecture.md
│   ├── signal-patterns.md
│   ├── performance.md
│   ├── asset-pipeline.md
│   ├── shader-workflow.md
│   ├── ui-system.md
│   ├── animation-system.md
│   ├── tilemap-system.md
│   ├── platform-compat.md
│   ├── project-structure.md
│   ├── networking.md
│   └── mcp-workflow.md
├── templates/                  # Built-in templates (30+)
│   ├── scaffolds/              # Scene scaffolds (4)
│   ├── scripts/                # GDScript templates (4)
│   ├── build-configs/          # Build configurations (4)
│   ├── presets/                # Import presets (2)
│   └── architecture-rules/    # Architecture rules (1)
├── src/                        # TypeScript analysis modules (12)
│   ├── analyzers/
│   ├── managers/
│   ├── generators/
│   └── engine/
├── hooks/                      # IDE hooks
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Official Godot Documentation References

This Power's domain knowledge is grounded in official Godot documentation:

| Domain | Official Docs |
|--------|---------------|
| GDScript Style | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html |
| Static Typing | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html |
| Scene Organization | https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html |
| Signals | https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html |
| Performance | https://docs.godotengine.org/en/stable/tutorials/performance/index.html |
| Export | https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html |
| Shaders | https://docs.godotengine.org/en/stable/tutorials/shaders/index.html |
| AnimationTree | https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html |
| TileMap | https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html |
| Multiplayer | https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html |
| UI/Control | https://docs.godotengine.org/en/stable/tutorials/ui/index.html |
| Asset Import | https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html |
| Project Organization | https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html |
| CLI Reference | https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not find Godot executable" | Set `GODOT_PATH` env variable in mcp.json to your Godot binary path |
| MCP tools not responding | Ensure godot-mcp is built (`npm run build`) and path in mcp.json is correct |
| "Invalid project path" | Provide absolute path containing `project.godot` |
| Node operations failing | Ensure a scene file exists at the specified path |
| UID tools not working | Requires Godot 4.4+; earlier versions use `res://` paths |
| Tests failing | Run `npm install` then `npm test` for detailed errors |

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for information on reporting security issues.

## License

MIT License. See the [LICENSE](LICENSE) file.
