# Scene Architecture — Steering File

## English Summary
This steering file covers Godot 4.x scene organization best practices based on official documentation.
Topics: scene composition vs inheritance, node communication patterns, PackedScene instancing, scene tree organization, and when to use sub-scenes.

## Official References
- Scene Organization: https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html
- Nodes and Scenes: https://docs.godotengine.org/en/stable/getting_started/step_by_step/nodes_and_scenes.html
- Instancing: https://docs.godotengine.org/en/stable/getting_started/step_by_step/instancing.html
- Scene Tree: https://docs.godotengine.org/en/stable/tutorials/scripting/scene_tree.html
- When and How to Avoid Using Nodes: https://docs.godotengine.org/en/stable/tutorials/best_practices/node_alternatives.html

---

## 核心原則

### 組合優於繼承（Composition over Inheritance）

Godot 的場景系統天然支持組合模式。每個場景（Scene）就是一個可重用的組件：

```
# ✅ 組合模式 — 每個能力是獨立場景
Player (CharacterBody2D)
├── Sprite2D
├── CollisionShape2D
├── HealthComponent (health_component.tscn)
├── HitboxComponent (hitbox_component.tscn)
├── StateMachine (state_machine.tscn)
└── AnimationPlayer

# ❌ 深層繼承 — 難以維護
BaseEntity → Character → Player → PlayerWarrior → PlayerWarriorElite
```

### 場景粒度指南

| 粒度 | 適用情境 | 範例 |
|---|---|---|
| 原子（Atomic） | 單一職責的可重用元件 | HealthComponent, HitboxComponent |
| 組合（Composite） | 由多個原子組成的實體 | Player, Enemy, NPC |
| 世界（World） | 完整的遊戲關卡或界面 | Level01, MainMenu |

## 節點通訊模式

### 規則：Call Down, Signal Up

```
Parent
├── Child_A  ← Parent 可以直接呼叫 Child_A 的方法
└── Child_B  ← Child_B 透過 Signal 通知 Parent
                （不應直接引用 Parent）
```

```gdscript
# Parent 呼叫子節點（向下）
func _on_button_pressed() -> void:
    $AnimationPlayer.play("fade_in")
    $AudioStreamPlayer.play()

# 子節點通知父節點（向上）— 使用 Signal
# health_component.gd
signal health_depleted

func take_damage(amount: int) -> void:
    current_health -= amount
    if current_health <= 0:
        health_depleted.emit()
```

### 兄弟節點通訊

兄弟節點不應直接互相引用。透過共同父節點或 Event Bus 中介：

```gdscript
# ✅ 透過父節點
# player.gd (父節點)
func _ready() -> void:
    $HealthComponent.health_depleted.connect($StateMachine.transition_to.bind("dead"))

# ✅ 透過 Event Bus（跨場景樹距離遠的節點）
# event_bus.gd (Autoload)
signal player_died
signal score_changed(new_score: int)
```

## 場景實例化（Instancing）

### PackedScene 預載入
```gdscript
# 在編譯時載入
const BulletScene: PackedScene = preload("res://scenes/bullet.tscn")

# 實例化
func _shoot() -> void:
    var bullet: Bullet = BulletScene.instantiate()
    bullet.global_position = muzzle.global_position
    bullet.direction = (get_global_mouse_position() - global_position).normalized()
    get_tree().current_scene.add_child(bullet)
```

### 動態載入（大量資源時）
```gdscript
# 運行時載入 — 適合可能不需要的資源
func _load_level(level_path: String) -> void:
    var scene: PackedScene = load(level_path)
    var level: Node = scene.instantiate()
    get_tree().current_scene.add_child(level)
```

## 場景樹結構範本

### 2D 平台遊戲
```
Main (Node2D)
├── World (Node2D)
│   ├── TileMapLayer
│   ├── Platforms (Node2D)
│   ├── Enemies (Node2D)
│   └── Collectibles (Node2D)
├── Player (CharacterBody2D)
│   ├── Sprite2D
│   ├── CollisionShape2D
│   ├── AnimationPlayer
│   ├── Camera2D
│   └── Components (Node)
│       ├── HealthComponent
│       └── InputComponent
└── UI (CanvasLayer)
    ├── HUD
    ├── PauseMenu
    └── GameOverScreen
```

### 3D 第一人稱
```
Main (Node3D)
├── World (Node3D)
│   ├── Environment (WorldEnvironment)
│   ├── Lighting (Node3D)
│   │   ├── DirectionalLight3D
│   │   └── OmniLights (Node3D)
│   ├── StaticGeometry (Node3D)
│   └── InteractableObjects (Node3D)
├── Player (CharacterBody3D)
│   ├── CollisionShape3D
│   ├── Head (Node3D)
│   │   └── Camera3D
│   ├── WeaponHolder (Node3D)
│   └── Components (Node)
│       ├── HealthComponent
│       └── InteractionRaycast
└── UI (CanvasLayer)
    ├── Crosshair
    ├── HUD
    └── PauseMenu
```

## Autoload (Singleton) 使用指南

### 適合 Autoload 的情境
- 全局事件匯流排（Event Bus）
- 遊戲狀態管理（GameManager）
- 音訊管理（AudioManager）
- 場景轉換（SceneTransition）
- 存檔系統（SaveManager）

### 不適合 Autoload 的情境
- 單一場景的邏輯（應放在場景內）
- 可以透過 Signal 解決的通訊
- 大量持有場景引用的管理器

```gdscript
# project.godot 中註冊
# [autoload]
# EventBus="*res://autoloads/event_bus.gd"
# GameManager="*res://autoloads/game_manager.gd"

# event_bus.gd
extends Node

signal player_died
signal level_completed
signal score_changed(new_score: int)
signal item_picked_up(item_data: ItemResource)
```

## 場景轉換最佳實踐

```gdscript
# scene_manager.gd (Autoload)
extends Node

signal scene_changed(scene_name: String)

var _current_scene: Node

func _ready() -> void:
    _current_scene = get_tree().current_scene

func change_scene(scene_path: String) -> void:
    call_deferred("_deferred_change_scene", scene_path)

func _deferred_change_scene(scene_path: String) -> void:
    _current_scene.free()
    var new_scene: PackedScene = load(scene_path)
    _current_scene = new_scene.instantiate()
    get_tree().root.add_child(_current_scene)
    get_tree().current_scene = _current_scene
    scene_changed.emit(scene_path)
```

## 反模式

### ❌ 避免
1. 超過 10 層深的節點層級
2. 在子節點中使用 `get_parent()` 或 `$"../"` 硬編碼路徑
3. 巨大的「God Scene」（一個場景包含所有邏輯）
4. 在 `_ready()` 中依賴節點載入順序
5. 跨越場景邊界的硬編碼 NodePath

### ✅ 解決方案
1. 使用場景組合扁平化層級
2. Signal up, Call down
3. 拆分為多個可重用場景
4. 使用 `await` 或 Signal 處理初始化順序
5. 使用 `@export NodePath` 或 Group 查找
