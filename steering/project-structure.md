# Project Structure — Steering File

## English Summary
Covers Godot 4.x project organization: folder conventions, naming rules,
Autoload management, plugin architecture, and version control best practices.

## Official References
- Project Organization: https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html
- Project Settings: https://docs.godotengine.org/en/stable/classes/class_projectsettings.html
- Plugins: https://docs.godotengine.org/en/stable/tutorials/plugins/editor/index.html
- Version Control: https://docs.godotengine.org/en/stable/tutorials/best_practices/version_control_systems.html

---

## 標準資料夾結構

```
project_root/
├── project.godot              # 專案設定檔
├── export_presets.cfg         # 匯出預設（加入版控）
├── .godot/                    # 引擎快取（不加入版控）
├── addons/                    # 第三方與自製插件
│   └── my_plugin/
│       ├── plugin.cfg
│       └── ...
├── autoloads/                 # 全域 Autoload 腳本
│   ├── event_bus.gd
│   ├── game_manager.gd
│   ├── audio_manager.gd
│   └── scene_manager.gd
├── scenes/                    # 場景檔 (.tscn)
│   ├── levels/
│   │   ├── level_01.tscn
│   │   └── level_02.tscn
│   ├── characters/
│   │   ├── player.tscn
│   │   └── enemies/
│   │       ├── slime.tscn
│   │       └── skeleton.tscn
│   ├── ui/
│   │   ├── hud.tscn
│   │   ├── main_menu.tscn
│   │   └── pause_menu.tscn
│   └── components/            # 可重用場景元件
│       ├── health_component.tscn
│       ├── hitbox_component.tscn
│       └── state_machine.tscn
├── scripts/                   # GDScript 檔案
│   ├── characters/
│   │   ├── player_controller.gd
│   │   └── enemy_base.gd
│   ├── systems/
│   │   ├── save_system.gd
│   │   └── quest_system.gd
│   ├── components/
│   │   ├── health_component.gd
│   │   └── hitbox_component.gd
│   ├── resources/             # 自定義 Resource class
│   │   ├── item_data.gd
│   │   ├── weapon_data.gd
│   │   └── dialogue_data.gd
│   └── ui/
│       ├── hud_controller.gd
│       └── inventory_ui.gd
├── assets/                    # 原始資源
│   ├── sprites/
│   ├── textures/
│   ├── models/
│   ├── audio/
│   │   ├── sfx/
│   │   └── music/
│   ├── fonts/
│   └── shaders/
├── resources/                 # .tres 資源實例
│   ├── items/
│   │   ├── sword_basic.tres
│   │   └── potion_health.tres
│   ├── themes/
│   │   └── main_theme.tres
│   └── tilesets/
│       └── overworld.tres
└── tests/                     # GUT 測試（如使用）
    ├── unit/
    └── integration/
```

## 命名規範

### 檔案命名
| 類型 | 規範 | 範例 |
|---|---|---|
| 場景 | snake_case.tscn | player.tscn, main_menu.tscn |
| 腳本 | snake_case.gd | player_controller.gd |
| 資源 | snake_case.tres | sword_basic.tres |
| Shader | snake_case.gdshader | dissolve.gdshader |
| 圖片 | snake_case.png | player_idle.png |
| 音效 | snake_case.wav/ogg | jump_land.wav |

### 節點命名
| 類型 | 規範 | 範例 |
|---|---|---|
| 一般節點 | PascalCase | Player, EnemySpawner |
| UI 節點 | PascalCase + 類型 | HealthBar, ScoreLabel |
| 容器 | PascalCase + Container | InventoryContainer |
| 分組節點 | PascalCase 複數 | Enemies, Collectibles |

### 腳本命名
| 類型 | 規範 | 範例 |
|---|---|---|
| class_name | PascalCase | PlayerController, HealthComponent |
| 變數 | snake_case | move_speed, max_health |
| 常數 | SCREAMING_SNAKE | MAX_SPEED, TILE_SIZE |
| Signal | snake_case 過去式 | health_changed, item_collected |
| 函數 | snake_case | get_damage(), _update_state() |
| 私有 | _prefix | _current_state, _process_input() |

## Autoload 管理

### 原則
- **最少化**：僅真正需要全域存取的才做 Autoload
- **單一職責**：每個 Autoload 只做一件事
- **無狀態偏好**：Event Bus 只傳遞事件，不持有狀態

### 建議的 Autoload
```ini
# project.godot
[autoload]
EventBus="*res://autoloads/event_bus.gd"
GameManager="*res://autoloads/game_manager.gd"
AudioManager="*res://autoloads/audio_manager.gd"
SceneManager="*res://autoloads/scene_manager.gd"
SaveManager="*res://autoloads/save_manager.gd"
```

### 載入順序
Autoload 按照 project.godot 中的宣告順序載入。依賴關係：
1. EventBus（無依賴）
2. GameManager（可能用 EventBus）
3. AudioManager（可能用 EventBus）
4. SaveManager（可能用 GameManager）
5. SceneManager（最後，因為可能 emit 事件）

## 版本控制

### .gitignore
```gitignore
# Godot 4.x
.godot/

# 匯出
builds/
*.pck
*.zip

# OS
.DS_Store
Thumbs.db
*.tmp

# IDE
.vscode/
*.code-workspace
```

### 應加入版控的檔案
- `project.godot`
- `export_presets.cfg`
- 所有 `.import` 檔案
- 所有 `.tscn`, `.tres`, `.gd`, `.gdshader` 檔案
- `addons/` 目錄

## Plugin 架構

### 插件結構
```
addons/my_plugin/
├── plugin.cfg              # 插件描述
├── my_plugin.gd            # EditorPlugin 腳本
├── custom_dock.tscn        # 自訂面板
├── custom_inspector.gd     # Inspector 擴展
└── icons/                  # 編輯器圖標
```

### plugin.cfg
```ini
[plugin]
name="My Plugin"
description="Plugin description"
author="Author Name"
version="1.0.0"
script="my_plugin.gd"
```
