# UI System — Steering File

## English Summary
Covers Godot 4.x UI development: Control node hierarchy, Theme resources, anchors/containers,
responsive design, accessibility, and common UI patterns.

## Official References
- UI Design: https://docs.godotengine.org/en/stable/tutorials/ui/index.html
- Control Nodes: https://docs.godotengine.org/en/stable/tutorials/ui/gui_containers.html
- Theme System: https://docs.godotengine.org/en/stable/tutorials/ui/gui_skinning.html
- Custom Controls: https://docs.godotengine.org/en/stable/tutorials/ui/custom_gui_controls.html
- Multiple Resolutions: https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html

---

## Control 節點層級

### 佈局容器
| 容器 | 用途 |
|---|---|
| VBoxContainer | 垂直排列子元素 |
| HBoxContainer | 水平排列子元素 |
| GridContainer | 網格排列 |
| MarginContainer | 添加邊距 |
| PanelContainer | 帶背景面板 |
| ScrollContainer | 可捲動區域 |
| TabContainer | 分頁面板 |
| CenterContainer | 置中子元素 |
| AspectRatioContainer | 保持子元素比例 |

### HUD 範例結構
```
CanvasLayer (layer=10)
└── Control (Full Rect anchor)
    ├── MarginContainer (Full Rect, margins=16)
    │   ├── VBoxContainer (Top-Left anchor)
    │   │   ├── HealthBar (TextureProgressBar)
    │   │   ├── ManaBar (TextureProgressBar)
    │   │   └── ScoreLabel (Label)
    │   └── VBoxContainer (Top-Right anchor)
    │       ├── MinimapContainer
    │       └── QuestTracker
    └── CenterContainer (Bottom anchor)
        └── HBoxContainer
            ├── SkillSlot1
            ├── SkillSlot2
            └── SkillSlot3
```

## Anchor 與 Margin 系統

### Anchor Presets
```gdscript
# 全螢幕
control.set_anchors_preset(Control.PRESET_FULL_RECT)

# 左上角
control.set_anchors_preset(Control.PRESET_TOP_LEFT)

# 底部中央
control.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)

# 自定義 anchor（佔螢幕右半部）
control.anchor_left = 0.5
control.anchor_top = 0.0
control.anchor_right = 1.0
control.anchor_bottom = 1.0
```

### 響應式設計
```gdscript
# 根據視窗大小調整
func _ready() -> void:
    get_tree().root.size_changed.connect(_on_viewport_resize)

func _on_viewport_resize() -> void:
    var viewport_size := get_viewport_rect().size
    if viewport_size.x < 600:
        _switch_to_mobile_layout()
    else:
        _switch_to_desktop_layout()
```

## Theme 系統

### Theme Resource 建立
```gdscript
# 程式化建立 Theme
var theme := Theme.new()

# 設定預設字體
var font := preload("res://assets/fonts/main_font.tres")
theme.set_default_font(font)
theme.set_default_font_size(16)

# 按鈕樣式
var button_normal := StyleBoxFlat.new()
button_normal.bg_color = Color("#2D2D2D")
button_normal.corner_radius_top_left = 4
button_normal.corner_radius_top_right = 4
button_normal.corner_radius_bottom_left = 4
button_normal.corner_radius_bottom_right = 4
theme.set_stylebox("normal", "Button", button_normal)

var button_hover := button_normal.duplicate()
button_hover.bg_color = Color("#3D3D3D")
theme.set_stylebox("hover", "Button", button_hover)
```

### Theme 繼承
```
Global Theme (Project Settings)
└── Scene Theme (root Control.theme)
    └── Node Theme Override (individual overrides)
```

## 常見 UI 模式

### 暫停選單
```gdscript
# pause_menu.gd
extends Control

func _ready() -> void:
    hide()
    process_mode = Node.PROCESS_MODE_WHEN_PAUSED

func _input(event: InputEvent) -> void:
    if event.is_action_pressed("pause"):
        toggle_pause()

func toggle_pause() -> void:
    var is_paused := not get_tree().paused
    get_tree().paused = is_paused
    visible = is_paused
    if is_paused:
        $ResumeButton.grab_focus()

func _on_resume_pressed() -> void:
    toggle_pause()

func _on_quit_pressed() -> void:
    get_tree().quit()
```

### 對話框系統
```gdscript
class_name DialogueBox
extends Control

signal dialogue_finished

@export var characters_per_second: float = 30.0

@onready var label: RichTextLabel = $RichTextLabel
@onready var name_label: Label = $NameLabel

var _current_text: String = ""
var _visible_chars: float = 0.0
var _is_typing: bool = false

func show_dialogue(speaker: String, text: String) -> void:
    name_label.text = speaker
    label.text = text
    label.visible_characters = 0
    _visible_chars = 0.0
    _is_typing = true
    show()

func _process(delta: float) -> void:
    if not _is_typing:
        return
    _visible_chars += characters_per_second * delta
    label.visible_characters = int(_visible_chars)
    if label.visible_characters >= label.get_total_character_count():
        _is_typing = false

func _input(event: InputEvent) -> void:
    if not visible:
        return
    if event.is_action_pressed("ui_accept"):
        if _is_typing:
            # 跳過打字動畫
            label.visible_characters = -1
            _is_typing = false
        else:
            hide()
            dialogue_finished.emit()
```

## 無障礙設計（Accessibility）

### 鍵盤/手把導航
```gdscript
# 確保所有互動元素可被 focus
button.focus_mode = Control.FOCUS_ALL

# 設定 focus 鄰居
button_a.focus_neighbor_bottom = button_b.get_path()
button_b.focus_neighbor_top = button_a.get_path()

# 場景載入後設定初始 focus
func _ready() -> void:
    await get_tree().process_frame
    $FirstButton.grab_focus()
```

### 文字可讀性
- 最小字體大小：14px（桌面）、18px（行動裝置）
- 文字與背景對比度 ≥ 4.5:1（WCAG AA）
- 提供字體大小調整選項
- 避免純色彩傳達資訊（色盲友善）

### 螢幕閱讀器支援
```gdscript
# Godot 4.x 尚未原生支援螢幕閱讀器
# 但可以為自定義 UI 提供替代文字
@export var accessibility_label: String = ""
```
