# Performance — Steering File

## English Summary
Covers Godot 4.x performance optimization: _process budgets, object pooling, visibility culling,
draw call reduction, memory management, physics optimization, and common anti-patterns.

## Official References
- Performance Best Practices: https://docs.godotengine.org/en/stable/tutorials/performance/index.html
- Using Servers: https://docs.godotengine.org/en/stable/tutorials/performance/using_servers.html
- Optimizing 3D Performance: https://docs.godotengine.org/en/stable/tutorials/3d/optimizing_3d_performance.html
- Thread-safe APIs: https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html
- Physics Process: https://docs.godotengine.org/en/stable/tutorials/physics/physics_introduction.html

---

## 幀預算概念

### 目標幀率與預算
| 目標 FPS | 每幀總預算 | 邏輯預算（建議） | 渲染預算 |
|---|---|---|---|
| 60 FPS | 16.67 ms | ≤ 5 ms | ≤ 11 ms |
| 30 FPS | 33.33 ms | ≤ 10 ms | ≤ 23 ms |
| 120 FPS | 8.33 ms | ≤ 3 ms | ≤ 5 ms |

## 12 大效能反模式

### 1. _process() 中做可用 Signal 觸發的事
```gdscript
# ❌ 每幀檢查
func _process(_delta: float) -> void:
    if health <= 0:
        die()

# ✅ 事件驅動
func take_damage(amount: int) -> void:
    health -= amount
    if health <= 0:
        die()
```

### 2. 未快取節點引用
```gdscript
# ❌ 每幀查詢節點樹
func _process(_delta: float) -> void:
    get_node("UI/HealthBar").value = health

# ✅ 快取引用
@onready var health_bar: ProgressBar = $UI/HealthBar

func _process(_delta: float) -> void:
    health_bar.value = health
```

### 3. 在迴圈中分配記憶體
```gdscript
# ❌ 每幀建立新陣列
func _process(_delta: float) -> void:
    var nearby: Array[Node] = get_tree().get_nodes_in_group("enemies")

# ✅ 預分配 + 定時查詢
var _nearby_enemies: Array[Node] = []
var _query_timer: float = 0.0

func _process(delta: float) -> void:
    _query_timer += delta
    if _query_timer >= 0.5:  # 每 0.5 秒查一次
        _query_timer = 0.0
        _nearby_enemies = get_tree().get_nodes_in_group("enemies")
```

### 4. 未使用物件池（Object Pooling）
```gdscript
# ❌ 頻繁 instantiate + queue_free
func shoot() -> void:
    var bullet := BulletScene.instantiate()
    add_child(bullet)
# bullet 結束後 queue_free()

# ✅ 物件池
class_name BulletPool
extends Node

var _pool: Array[Bullet] = []
var _bullet_scene: PackedScene = preload("res://scenes/bullet.tscn")

func get_bullet() -> Bullet:
    for bullet in _pool:
        if not bullet.active:
            bullet.activate()
            return bullet
    # 池子不夠大時擴展
    var new_bullet: Bullet = _bullet_scene.instantiate()
    add_child(new_bullet)
    _pool.append(new_bullet)
    return new_bullet
```

### 5. 過多的 _process 回呼
```gdscript
# ❌ 不需要每幀更新的節點仍在 _process
# ✅ 不需要時停用
func _ready() -> void:
    set_process(false)  # 預設關閉

func activate() -> void:
    set_process(true)

func deactivate() -> void:
    set_process(false)
```

### 6. 可見性未優化
```gdscript
# ✅ 使用 VisibleOnScreenNotifier2D/3D
func _ready() -> void:
    $VisibleOnScreenNotifier2D.screen_exited.connect(_on_screen_exited)
    $VisibleOnScreenNotifier2D.screen_entered.connect(_on_screen_entered)

func _on_screen_exited() -> void:
    set_process(false)
    set_physics_process(false)

func _on_screen_entered() -> void:
    set_process(true)
    set_physics_process(true)
```

### 7. 過度使用 String 操作
```gdscript
# ❌ 每幀格式化字串
func _process(_delta: float) -> void:
    label.text = "Score: %d | Health: %d | Time: %.1f" % [score, health, time]

# ✅ 僅在變更時更新
func _on_score_changed(new_score: int) -> void:
    score_label.text = "Score: %d" % new_score
```

### 8. Physics 物件過多
```gdscript
# ✅ 使用 Area2D 替代 RigidBody2D（不需要物理模擬時）
# ✅ 使用碰撞層/遮罩精確過濾
# ✅ 減少碰撞形狀複雜度（用 rectangle 替代 polygon）
```

### 9. 大型場景單次載入
```gdscript
# ✅ 使用 ResourceLoader 異步載入
func _load_level_async(path: String) -> void:
    ResourceLoader.load_threaded_request(path)
    _loading = true

func _process(_delta: float) -> void:
    if _loading:
        var status := ResourceLoader.load_threaded_get_status(_level_path)
        if status == ResourceLoader.THREAD_LOAD_LOADED:
            var scene: PackedScene = ResourceLoader.load_threaded_get(_level_path)
            _loading = false
            _switch_to_scene(scene)
```

### 10. Shader 重複編譯
```gdscript
# ✅ 預熱 Shader — 在載入畫面時將所有材質可見一幀
# ✅ 使用 ShaderMaterial 而非每個節點獨立 Shader
```

### 11. 大量 CanvasItem draw 呼叫
```gdscript
# ✅ 批量繪製使用單一自訂 _draw()
# ✅ 靜態內容使用預渲染 Texture
# ✅ TileMap 自動批量渲染比散落 Sprite2D 高效
```

### 12. GDScript 熱路徑未優化
```gdscript
# 對效能敏感的內迴圈考慮：
# - 使用 C# 或 GDExtension（C++）
# - 減少 Dictionary 查詢（改用具型陣列）
# - 避免使用 Variant 類型（明確靜態型別）
```

## 效能分析工具

### 內建工具
- **Debugger → Monitors** — FPS, Physics, Memory 即時監控
- **Debugger → Profiler** — 函數級效能分析
- **Debugger → Visual Profiler** — GPU 渲染時間分析
- **Project Settings → Debug → Settings** — 顯示碰撞形狀、導航網格

### 指令
```
# 顯示效能統計
Engine.get_frames_per_second()
Performance.get_monitor(Performance.TIME_PROCESS)
Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
Performance.get_monitor(Performance.MEMORY_STATIC)
```

## 平台特定優化

| 平台 | 記憶體預算 | 建議 |
|---|---|---|
| 桌面 | 2-4 GB | 可用高品質資源 |
| 行動裝置 | 512 MB - 1 GB | 壓縮紋理、減少 draw calls |
| Web | 256 - 512 MB | 最小包體、延遲載入 |
| 主機 | 依平台 | 固定幀率、嚴格預算 |
