# Animation System — Steering File

## English Summary
Covers Godot 4.x animation: AnimationPlayer, AnimationTree, StateMachinePlayback,
BlendTree, blend spaces, call/method tracks, and animation best practices.

## Official References
- AnimationPlayer: https://docs.godotengine.org/en/stable/tutorials/animation/introduction.html
- AnimationTree: https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html
- State Machine: https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html#state-machine
- Cutout Animation: https://docs.godotengine.org/en/stable/tutorials/animation/cutout_animation.html

---

## AnimationPlayer 基礎

### 設定結構
```
Character (CharacterBody2D)
├── Sprite2D
├── AnimationPlayer
│   ├── idle (Animation)
│   ├── run (Animation)
│   ├── jump (Animation)
│   └── attack (Animation)
└── AnimationTree
```

### 從腳本控制
```gdscript
@onready var anim_player: AnimationPlayer = $AnimationPlayer

func _update_animation(velocity: Vector2) -> void:
    if velocity.length() > 10.0:
        anim_player.play("run")
    else:
        anim_player.play("idle")

# 播放並等待完成
func _play_attack() -> void:
    anim_player.play("attack")
    await anim_player.animation_finished
    _return_to_idle()
```

## AnimationTree 與 StateMachine

### 狀態機設定
```gdscript
@onready var anim_tree: AnimationTree = $AnimationTree
@onready var state_machine: AnimationNodeStateMachinePlayback = \
    anim_tree["parameters/playback"]

func _physics_process(_delta: float) -> void:
    _update_animation_parameters()

func _update_animation_parameters() -> void:
    # 設定 BlendSpace 參數
    anim_tree["parameters/Move/blend_position"] = velocity.normalized()

    # 狀態轉換
    if is_on_floor():
        if velocity.length() > 10.0:
            state_machine.travel("Run")
        else:
            state_machine.travel("Idle")
    else:
        if velocity.y < 0:
            state_machine.travel("Jump")
        else:
            state_machine.travel("Fall")
```

### 狀態機結構
```
AnimationTree
└── AnimationNodeStateMachine (root)
    ├── Idle → Run (condition: speed > 0)
    ├── Run → Idle (condition: speed == 0)
    ├── Idle/Run → Jump (condition: is_jumping)
    ├── Jump → Fall (auto, when animation ends)
    ├── Fall → Idle (condition: is_on_floor)
    └── Any → Attack (condition: attack_triggered, priority)
```

## BlendTree / BlendSpace

### 1D BlendSpace（行走速度）
```
BlendSpace1D
├── point 0.0 → idle
├── point 0.5 → walk
└── point 1.0 → run

# 控制
anim_tree["parameters/MoveBlend/blend_position"] = move_speed / max_speed
```

### 2D BlendSpace（方向移動）
```
BlendSpace2D
├── (0, 0) → idle
├── (0, 1) → walk_forward
├── (0, -1) → walk_backward
├── (1, 0) → walk_right
└── (-1, 0) → walk_left

# 控制
var blend_pos := velocity.normalized()
anim_tree["parameters/MoveBlend2D/blend_position"] = blend_pos
```

## 動畫軌道類型

### 常用軌道
| 軌道類型 | 用途 | 範例 |
|---|---|---|
| Property | 修改節點屬性 | position, modulate, scale |
| Method Call | 呼叫函數 | spawn_particle(), play_sfx() |
| Bezier | 平滑曲線動畫 | 自然的位移/旋轉 |
| Audio | 播放音效 | 腳步聲、攻擊音效 |
| Animation | 播放其他動畫 | 子動畫組合 |

### Method Track 最佳實踐
```gdscript
# 在動畫中呼叫的方法要短小且無副作用
func _spawn_hit_effect() -> void:
    var effect := HitEffectScene.instantiate()
    effect.global_position = $HitPoint.global_position
    get_tree().current_scene.add_child(effect)

func _play_footstep_sound() -> void:
    $FootstepAudio.play()
```

## 動畫最佳實踐

### Do's
- 使用 AnimationTree 管理複雜動畫邏輯（不在腳本中硬寫轉換）
- 分離動畫邏輯與遊戲邏輯
- 使用 `advance_expression` 做條件轉換
- 利用 AnimationLibrary 組織大量動畫

### Don'ts
- 不要在 `_process()` 中手動計算補間（用 Tween 或 Animation）
- 不要直接修改 AnimationTree 的內部節點結構（運行時）
- 避免動畫中修改物理相關屬性（改用 `_physics_process`）

## Tween 系統（程序化動畫）

```gdscript
# 簡單 Tween
func _fade_in() -> void:
    var tween := create_tween()
    tween.tween_property(self, "modulate:a", 1.0, 0.5)

# 序列動畫
func _bounce_effect() -> void:
    var tween := create_tween()
    tween.tween_property($Sprite2D, "scale", Vector2(1.2, 0.8), 0.1)
    tween.tween_property($Sprite2D, "scale", Vector2(0.9, 1.1), 0.1)
    tween.tween_property($Sprite2D, "scale", Vector2.ONE, 0.1)

# 平行動畫
func _death_animation() -> void:
    var tween := create_tween().set_parallel(true)
    tween.tween_property(self, "modulate:a", 0.0, 1.0)
    tween.tween_property(self, "position:y", position.y - 50, 1.0)
    tween.chain().tween_callback(queue_free)
```
