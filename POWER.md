# Kiro Godot Accelerator

An intelligent Godot Engine development accelerator Power that integrates MCP tools
(via [bradypp/godot-mcp](https://github.com/bradypp/godot-mcp)) to provide natural-language-driven control over Godot Editor. Automates scene management, node/component operations, GDScript generation, asset management, build automation, performance analysis, code quality checks, shader workflows, and more. Supports Godot 4.3+ / 4.4+.

Keywords: godot, godot4, gdscript, scene, node, signal, shader, tilemap, animation, performance, asset, game, 2d, 3d

## Capabilities

- Scene Management & Building — Create, open, save scenes; generate complete scene structures from templates (2D platformer, 3D FPS, top-down, UI-only)
- Node & Component Operations — Create/delete/move nodes, add scripts, set properties, manage scene tree hierarchy
- GDScript Generation & Optimization — Generate type-safe GDScript with signals, exports, state machines, component patterns
- Asset Pipeline Automation — Batch import, auto-detect types, validate references, detect unused assets, configure import presets
- Build Automation — Multi-platform exports (Windows/macOS/Linux/Web/Android/iOS), headless CLI builds, export preset management
- Performance Analysis — Code anti-pattern scanning (12 patterns), runtime profiling, draw call analysis, memory budgets
- Code Quality Checking — Signal coupling analysis, circular dependency detection, naming convention enforcement, scene composition validation
- Shader Workflow — Visual Shader and text shader templates, platform compatibility checks, shader parameter management
- TileMap & TileSet Tooling — TileMap layer management, TileSet atlas configuration, auto-tile rules, terrain painting
- Animation System — AnimationPlayer/AnimationTree templates, state machine generation, blend tree configuration
- UI System — Control node hierarchies, Theme resource generation, responsive layout patterns, accessibility compliance
- Signal Architecture — Event bus patterns, signal declaration generation, coupling analysis, decoupled communication

## MCP Tool Mapping

Maps user intents to the appropriate MCP tools. All tools route through the godot-mcp server.

| User Intent | Primary Tool | Supporting Tools |
|---|---|---|
| Launch Godot Editor | launch_editor | get_godot_version |
| Run/debug project | run_project | get_debug_output, stop_project |
| Get project info | get_project_info | list_projects |
| Create scenes | create_scene | add_node, save_scene |
| Add/modify nodes | add_node, edit_node | load_sprite, save_scene |
| Remove nodes | remove_node | save_scene |
| Load textures/sprites | load_sprite | add_node, edit_node |
| Export MeshLibrary | export_mesh_library | get_project_info |
| Save scene variants | save_scene | create_scene |
| Get file UIDs (4.4+) | get_uid | update_project_uids |
| Update UID references | update_project_uids | get_uid |

## Steering Files Index

Steering files provide domain-specific knowledge and best practices. Kiro should consult the relevant steering file before giving advice in that domain.

| File | Domain | Coverage |
|---|---|---|
| steering/gdscript-patterns.md | GDScript Best Practices | Type annotations, signal patterns, export variables, class_name usage, static typing, coroutines |
| steering/scene-architecture.md | Scene Architecture | Scene composition vs inheritance, node communication, scene instancing, PackedScene workflows |
| steering/signal-patterns.md | Signal System | Signal declaration, emission patterns, Event Bus (Autoload), decoupled architecture, signal-vs-call decision tree |
| steering/performance.md | Performance | _process vs _physics_process budgets, object pooling, visibility optimization, LOD, occlusion culling |
| steering/asset-pipeline.md | Asset Pipeline | Import presets, resource types, .import configuration, texture compression, audio stream types |
| steering/shader-workflow.md | Shaders | VisualShader vs text shaders, shader parameters, screen-reading shaders, platform considerations |
| steering/ui-system.md | UI/Control | Control node hierarchy, Theme resources, anchors/margins, responsive design, accessibility |
| steering/animation-system.md | Animation | AnimationPlayer, AnimationTree, StateMachine, BlendTree, call tracks, method tracks |
| steering/tilemap-system.md | TileMap | TileSet resources, atlas sources, terrain sets, physics layers, navigation layers |
| steering/platform-compat.md | Platform Compatibility | Export presets, renderer selection (Forward+/Mobile/Compatibility), GPU requirements, memory budgets |
| steering/project-structure.md | Project Organization | Folder structure, naming conventions, Autoload management, plugin architecture |
| steering/networking.md | Multiplayer | MultiplayerSpawner, MultiplayerSynchronizer, RPC patterns, authority model, server/client architecture |
| steering/mcp-workflow.md | MCP Best Practices | Tool call sequencing, verify-before-act patterns, error handling, project path validation |

## Templates Index

Templates are JSON definitions used to generate Godot scenes, scripts, and configurations.

| Directory | Count | Contents |
|---|---|---|
| templates/presets/ | 6 | Import presets — texture-2d, texture-pixel-art, audio-sfx, audio-music, model-3d, font-resource |
| templates/scaffolds/ | 6 | Scene scaffolds — platformer-2d, fps-3d, top-down-2d, rpg-3d, ui-menu, multiplayer-lobby |
| templates/scripts/ | 8 | GDScript templates — character-controller-2d, character-controller-3d, state-machine, component-health, component-inventory, singleton-event-bus, ui-manager, save-system |
| templates/shaders/ | 4 | Shader templates — sprite-outline, dissolve-effect, water-2d, toon-lighting |
| templates/build-configs/ | 4 | Build configurations — windows-release, web-release, android-release, ios-release |
| templates/platform-profiles/ | 5 | Platform profiles — desktop, mobile, web, console, xr |
| templates/architecture-rules/ | 3 | Architecture rules — naming-conventions, folder-structure, dependency-rules |
| templates/workflows/ | 4 | Workflow templates — asset-import-pipeline, build-and-export, performance-audit, scene-refactor |

## Intent Routing Rules

When a user request arrives, route it through these rules to select the right combination of tools, steering files, and templates.

### Scene Workflows

- "create a scene / new scene" → `steering/scene-architecture.md` → `templates/scaffolds/*` → `create_scene` + `add_node`
- "add node to scene" → `steering/scene-architecture.md` → `add_node` + `edit_node`
- "build a 2D platformer level" → `steering/scene-architecture.md` → `templates/scaffolds/platformer-2d.json` → `create_scene` + `add_node`
- "create UI menu" → `steering/ui-system.md` → `templates/scaffolds/ui-menu.json` → `create_scene` + `add_node`

### GDScript Generation

- "create a player script" → `steering/gdscript-patterns.md` → `templates/scripts/character-controller-*.json` → generate script
- "create state machine" → `steering/gdscript-patterns.md` → `templates/scripts/state-machine.json` → generate script
- "create event bus / signal bus" → `steering/signal-patterns.md` → `templates/scripts/singleton-event-bus.json` → generate script
- "add health component" → `steering/gdscript-patterns.md` → `templates/scripts/component-health.json` → generate script

### Asset Workflows

- "import textures / configure assets" → `steering/asset-pipeline.md` → `templates/presets/*` → asset configuration
- "set up pixel art import" → `steering/asset-pipeline.md` → `templates/presets/texture-pixel-art.json` → import preset
- "find unused assets" → AssetAnalyzer → `get_project_info`

### Performance & Quality

- "optimize performance / check FPS" → `steering/performance.md` → PerformanceAnalyzer → profiling
- "check code quality" → `steering/gdscript-patterns.md` → CodeQualityAnalyzer
- "analyze signal coupling" → `steering/signal-patterns.md` → SignalAnalyzer
- "check platform compatibility" → `steering/platform-compat.md` → CompatibilityChecker → `templates/platform-profiles/*`

### Shader Workflows

- "create shader / visual shader" → `steering/shader-workflow.md` → `templates/shaders/*` → shader generation
- "add outline to sprite" → `steering/shader-workflow.md` → `templates/shaders/sprite-outline.json`
- "create dissolve effect" → `steering/shader-workflow.md` → `templates/shaders/dissolve-effect.json`

### Animation Workflows

- "set up animation tree" → `steering/animation-system.md` → AnimationTree configuration
- "create state machine for character" → `steering/animation-system.md` → AnimationTree + StateMachine

### Build & Export

- "build the project / export" → `templates/build-configs/*` → `run_project` (headless export)
- "export for web" → `templates/build-configs/web-release.json` → headless export
- "check Android compatibility" → `steering/platform-compat.md` → `templates/platform-profiles/mobile.json`

### TileMap Workflows

- "set up tilemap / tileset" → `steering/tilemap-system.md` → TileMap configuration
- "configure terrain painting" → `steering/tilemap-system.md` → TileSet terrain sets

### Multiplayer Workflows

- "set up multiplayer" → `steering/networking.md` → MultiplayerSpawner + MultiplayerSynchronizer
- "create dedicated server" → `steering/networking.md` → headless export + RPC patterns

## Known Issues & Dangerous Operations

### Scene file format is strict

Godot `.tscn` and `.tres` files use a specific text-based resource format. When generating or modifying these files programmatically, always validate the syntax. Malformed resource files will cause Godot to fail loading the scene silently or display parse errors.

### `run_project` blocks until game window closes

When using `run_project`, the MCP server process waits for the Godot process to exit. For testing purposes, use `stop_project` to terminate. For export operations, use `--headless --export-release` flags.

### UID system requires Godot 4.4+

The `get_uid` and `update_project_uids` tools only work with Godot 4.4 and later. For earlier versions, use `res://` resource paths directly.

### GDScript static typing strictness

When generating GDScript, always use static type annotations (`: Type`) for all variables, parameters, and return types. Godot 4.x supports static typing and it catches bugs at parse time. Never generate untyped GDScript.

### Avoid deep node hierarchies

Godot's scene tree performance degrades with excessively deep hierarchies (>10 levels). Prefer composition (multiple scenes instanced as siblings) over deep nesting.

## Analysis Modules

TypeScript modules providing deep analysis capabilities. Located in `src/`.

| Module | Path | Description |
|---|---|---|
| SceneManager | src/managers/SceneManager.ts | Scene creation from templates, node hierarchy generation, scene instancing, variant management |
| ScriptGenerator | src/generators/ScriptGenerator.ts | GDScript generation with type annotations, signal declarations, export variables, state machines |
| ShaderGenerator | src/generators/ShaderGenerator.ts | Shader code generation (text & VisualShader), parameter setup, platform validation |
| AssetAnalyzer | src/analyzers/AssetAnalyzer.ts | Asset type detection, import preset validation, unused asset scanning, reference integrity checks |
| PerformanceAnalyzer | src/analyzers/PerformanceAnalyzer.ts | Anti-pattern detection (12 patterns), _process budget analysis, draw call estimation, memory profiling |
| CodeQualityAnalyzer | src/analyzers/CodeQualityAnalyzer.ts | Naming convention checks, signal coupling measurement, circular dependency detection, composition validation |
| SignalAnalyzer | src/analyzers/SignalAnalyzer.ts | Signal declaration scanning, emission tracking, coupling graph generation, Event Bus validation |
| CompatibilityChecker | src/analyzers/CompatibilityChecker.ts | Platform renderer checks, GPU feature requirements, memory budget validation, export preset verification |
| WorkflowEngine | src/engine/WorkflowEngine.ts | Multi-step workflow execution, dependency ordering, conditional branching, error recovery |
| ReportGenerator | src/generators/ReportGenerator.ts | Multi-format reports (JSON, Markdown), performance dashboards, quality scorecards |
| TileMapManager | src/managers/TileMapManager.ts | TileSet configuration, atlas source setup, terrain rules, physics/navigation layer management |
| AnimationManager | src/managers/AnimationManager.ts | AnimationPlayer track generation, AnimationTree state machine configuration, blend tree setup |
