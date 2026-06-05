# GDScript Best Practices — Steering File

## English Summary
This steering file covers GDScript coding standards for Godot 4.x based on official documentation.
Topics: static typing, signal patterns, export variables, class_name usage, coroutines (await), naming conventions, and anti-patterns to avoid.

## Official References
- GDScript Style Guide: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html
- GDScript Reference: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html
- Static Typing: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html
- GDScript Exports: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_exports.html

---

## 命名規範（Naming Conventions）

### 檔案與類別
- 腳本檔案名稱：`snake_case.gd`（例：`player_controller.gd`）
- class_name：`PascalCase`（例：`class_name PlayerController`）
- 場景檔案：`snake_case.tscn`（例：`main_menu.tscn`）

### 變數與函數
- 變數：`snake_case`（例：`move_speed`, `max_health`）
- 常數：`SCREAMING_SNAKE_CASE`（例：`MAX_SPEED`, `GRAVITY`）
- 私有變數（慣例）：`_underscore_prefix`（例：`_current_state`）
- 函數：`snake_case`（例：`get_damage()`, `apply_force()`）
- Signal：`snake_case` 過去式（例：`health_changed`, `enemy_died`）
- Enum：`PascalCase` 名稱，`SCREAMING_SNAKE_CASE` 值

```gdscript
enum State {
    IDLE,
    RUNNING,
    JUMPING,
    FALLING,
}
```

## 靜態型別（Static Typing）

### 強制規則
Godot 4.x 支援完整靜態型別系統。所有新代碼必須使用型別註解：

```gdscript
# ✅ 正確 — 完整型別註解
var health: int = 100
var move_speed: float = 200.0
var player_name: String = "Hero"
var inventory: Array[Item] = []
var position_cache: Dictionary = {}

func take_damage(amount: int, source: Node) -> void:
    health -= amount
    if health <= 0:
        _die()

func get_nearest_enemy(radius: float) -> Enemy:
    # ...
    return nearest

# ❌ 錯誤 — 缺少型別
var health = 100
func take_damage(amount, source):
    pass
```

### 型別推斷
使用 `:=` 讓編譯器推斷型別（僅適用於明確的右值）：

```gdscript
var speed := 200.0          # 推斷為 float
var node := get_node("Player")  # 推斷為 Node — 不夠精確！

# 優先明確指定：
var player: CharacterBody2D = get_node("Player")
```

## Export 變數

### 基本 Export
```gdscript
@export var move_speed: float = 200.0
@export var jump_force: float = -400.0
@export var max_health: int = 100
```

### 分組與範圍
```gdscript
@export_group("Movement")
@export var move_speed: float = 200.0
@export_range(0.0, 1.0, 0.01) var friction: float = 0.1

@export_group("Combat")
@export var damage: int = 10
@export var attack_range: float = 50.0

@export_subgroup("Projectile")
@export var projectile_scene: PackedScene
@export var projectile_speed: float = 500.0
```

### Resource Export
```gdscript
@export var weapon_data: WeaponResource
@export var character_stats: CharacterStats
@export var dialogue: DialogueResource
```

## Signal 宣告與使用

### 宣告
```gdscript
signal health_changed(new_health: int, max_health: int)
signal died
signal item_collected(item: Item)
signal state_changed(old_state: State, new_state: State)
```

### 發射
```gdscript
func take_damage(amount: int) -> void:
    health -= amount
    health_changed.emit(health, max_health)
    if health <= 0:
        died.emit()
```

### 連接
```gdscript
# 優先在 _ready() 中以代碼連接
func _ready() -> void:
    health_component.health_changed.connect(_on_health_changed)
    health_component.died.connect(_on_died)

func _on_health_changed(new_health: int, max_health: int) -> void:
    health_bar.value = new_health

func _on_died() -> void:
    queue_free()
```

## 協程（Coroutines / await）

```gdscript
func spawn_enemies(count: int) -> void:
    for i in count:
        _spawn_single_enemy()
        await get_tree().create_timer(0.5).timeout

func play_cutscene() -> void:
    animation_player.play("intro")
    await animation_player.animation_finished
    dialogue_box.start("welcome")
    await dialogue_box.dialogue_finished
    _enable_player_control()
```

## 常見反模式（Anti-Patterns）

### ❌ 避免
1. 在 `_process()` 中做可以用 Signal 觸發的事
2. 過度使用 `get_node()` 而不快取引用
3. 字串路徑硬編碼（使用 `@onready` 或 `@export`）
4. 省略型別註解
5. 在子節點中直接引用父節點（緊耦合）
6. 使用 `await` 卻不處理節點被銷毀的情況

### ✅ 正確做法
```gdscript
# 快取節點引用
@onready var sprite: Sprite2D = $Sprite2D
@onready var collision: CollisionShape2D = $CollisionShape2D
@onready var animation_player: AnimationPlayer = $AnimationPlayer

# 用 Signal 而非輪詢
# 不要在 _process 裡檢查 health <= 0
# 而是在 take_damage() 時 emit died signal

# 安全的 await
func _do_delayed_action() -> void:
    await get_tree().create_timer(1.0).timeout
    if not is_instance_valid(self):
        return
    # 安全地繼續
```

## 腳本結構順序（Script Organization）

依照官方風格指南的建議順序：

```gdscript
class_name MyClass
extends Node2D

# 1. Signals
signal health_changed(value: int)

# 2. Enums
enum State { IDLE, RUNNING, JUMPING }

# 3. Constants
const MAX_SPEED: float = 400.0

# 4. Exported variables
@export var move_speed: float = 200.0

# 5. Public variables
var health: int = 100

# 6. Private variables
var _current_state: State = State.IDLE

# 7. @onready variables
@onready var sprite: Sprite2D = $Sprite2D

# 8. Built-in virtual methods
func _ready() -> void:
    pass

func _process(delta: float) -> void:
    pass

func _physics_process(delta: float) -> void:
    pass

# 9. Public methods
func take_damage(amount: int) -> void:
    pass

# 10. Private methods
func _update_animation() -> void:
    pass
```
