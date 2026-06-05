# Signal Patterns — Steering File

## English Summary
This steering file covers Godot 4.x signal system best practices: Observer pattern implementation,
Event Bus architecture, signal-vs-direct-call decision tree, coupling analysis, and common pitfalls.

## Official References
- Signals: https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html
- Custom Signals: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html#signals
- Best Practices (Node Communication): https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html

---

## Signal vs Direct Call 決策樹

```
需要通訊？
├── 父 → 子？ → 直接呼叫方法（Call Down）
├── 子 → 父？ → 使用 Signal（Signal Up）
├── 兄弟節點？
│   ├── 同場景內？ → 透過共同父節點中介
│   └── 跨場景？ → Event Bus（Autoload Signal）
├── 全局事件？ → Event Bus
└── 一對多通知？ → Signal（天然支持多個接收者）
```

## Signal 宣告最佳實踐

### 命名規範
- 使用過去式動詞：`health_changed`, `enemy_died`, `item_collected`
- 帶參數的 Signal 必須明確型別：

```gdscript
# ✅ 正確
signal health_changed(new_value: int, max_value: int)
signal damage_taken(amount: int, source: Node, type: DamageType)
signal inventory_updated(slot_index: int, item: ItemResource)

# ❌ 不良 — 缺少型別、名稱不清
signal changed
signal signal1(a, b)
```

### Signal 參數設計
- 傳遞接收者需要的資訊，不要強迫接收者再查詢
- 避免傳遞 `self`（接收者已可從連接獲知）
- 使用 Resource 或 Dictionary 打包複雜資料

```gdscript
# ✅ 提供完整上下文
signal attack_landed(damage: int, target: Node, is_critical: bool)

# ❌ 迫使接收者回查
signal attack_landed  # 接收者得自己猜 damage 是多少
```

## Event Bus 模式

### 全局事件匯流排實作

```gdscript
# autoloads/event_bus.gd
extends Node

# 遊戲流程
signal game_started
signal game_paused
signal game_resumed
signal game_over(is_victory: bool)

# 玩家事件
signal player_spawned(player: CharacterBody2D)
signal player_died(player: CharacterBody2D)
signal player_health_changed(current: int, maximum: int)

# 分數與進度
signal score_changed(new_score: int)
signal level_completed(level_id: int, time_seconds: float)
signal achievement_unlocked(achievement_id: String)

# UI 事件
signal show_dialogue(dialogue_resource: Resource)
signal notification_requested(message: String, type: String)

# 音訊事件
signal play_sfx(sfx_name: String)
signal play_music(track_name: String, fade_duration: float)
```

### 使用方式

```gdscript
# 發射者（不需要知道誰在聽）
# player.gd
func _die() -> void:
    EventBus.player_died.emit(self)

# 接收者（UI 場景中）
# hud.gd
func _ready() -> void:
    EventBus.player_health_changed.connect(_update_health_bar)
    EventBus.score_changed.connect(_update_score_label)

func _update_health_bar(current: int, maximum: int) -> void:
    health_bar.max_value = maximum
    health_bar.value = current
```

## 連接管理

### 安全連接

```gdscript
func _ready() -> void:
    # 使用 CONNECT_ONE_SHOT 只觸發一次
    button.pressed.connect(_on_first_press, CONNECT_ONE_SHOT)

    # 條件性連接（避免重複連接）
    if not EventBus.player_died.is_connected(_on_player_died):
        EventBus.player_died.connect(_on_player_died)

func _exit_tree() -> void:
    # 斷開全局 Signal 避免記憶體洩漏
    if EventBus.player_died.is_connected(_on_player_died):
        EventBus.player_died.disconnect(_on_player_died)
```

### Callable 綁定

```gdscript
# 使用 bind() 附加額外參數
func _ready() -> void:
    for i in button_list.size():
        button_list[i].pressed.connect(_on_button_pressed.bind(i))

func _on_button_pressed(index: int) -> void:
    print("Button %d pressed" % index)
```

## 耦合度分析

### 低耦合（理想）
```
Player → Signal → HUD (只知道 Signal 存在，不知道誰接收)
Player → Signal → SoundManager
Player → Signal → AchievementTracker
```

### 高耦合（避免）
```
Player → $"../UI/HUD".update_health(health)  # 硬編碼路徑
Player → GameManager.instance.ui.hud.set_health(health)  # 鏈式引用
```

### 耦合度指標
- **Signal 連接數** > 10 對同一節點 → 考慮拆分
- **跨場景直接引用** → 改用 Event Bus
- **Autoload 間互相引用** → 設計問題，需要重構

## 反模式

### ❌ Signal 反模式
1. **Signal 瀑布** — A emit → B emit → C emit → A emit（循環）
2. **過度使用 Event Bus** — 場景內通訊不需要全局 Signal
3. **忽略斷開** — 節點銷毀前不斷開全局 Signal → 記憶體洩漏
4. **Signal 替代返回值** — 同步操作不需要 Signal
5. **參數爆炸** — 一個 Signal 傳超過 4 個參數 → 改用 Resource

### ✅ 正確做法
```gdscript
# 使用 Resource 封裝複雜 Signal 資料
class_name DamageEvent
extends Resource

@export var amount: int
@export var type: DamageType
@export var source_position: Vector2
@export var is_critical: bool
@export var status_effects: Array[StatusEffect]

# Signal 只傳一個 Resource
signal damage_received(event: DamageEvent)
```
