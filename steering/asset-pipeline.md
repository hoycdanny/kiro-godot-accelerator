# Asset Pipeline — Steering File

## English Summary
Covers Godot 4.x asset import workflow: import presets, resource types, texture compression,
audio stream configuration, 3D model import settings, and font resources.

## Official References
- Importing Assets: https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_assets.html
- Import Presets: https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html
- Texture Import: https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_images.html
- 3D Model Import: https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes.html
- Audio Import: https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_audio_samples.html
- Resource System: https://docs.godotengine.org/en/stable/tutorials/scripting/resources.html

---

## 資源類型總覽

### Godot 資源系統
- **Resource (`.tres`)** — 文字格式，可版本控制
- **Binary Resource (`.res`)** — 二進位格式，體積小但不可讀
- **PackedScene (`.tscn`)** — 場景檔（文字格式）
- **PackedScene (`.scn`)** — 場景檔（二進位）

### 建議
- 開發階段使用文字格式（`.tres`, `.tscn`）方便 Git diff
- 發佈版本自動轉為二進位

## 紋理匯入設定

### 2D 像素遊戲
```
Filter: Nearest (不模糊)
Mipmaps: Off
Repeat: Disabled
Compress/Mode: Lossless
Fix Alpha Border: Off
```

### 2D HD 遊戲
```
Filter: Linear
Mipmaps: On (if zooming)
Compress/Mode: VRAM Compressed (平台自動選擇)
```

### 3D 紋理
```
Filter: Linear with Mipmaps
Compress/Mode: VRAM Compressed
  - Desktop: S3TC (BC1-BC5)
  - Mobile: ETC2 / ASTC
  - Web: S3TC + ETC2 fallback
Normal Map: Enable "Normal Map" flag
```

### 匯入預設組態範例
```ini
# .import 檔案範例（由 Godot 自動生成）
[remap]
importer="texture"
type="CompressedTexture2D"

[deps]
source_file="res://assets/sprites/player.png"

[params]
compress/mode=0        # Lossless
compress/high_quality=false
mipmaps/generate=false
roughness/mode=0
process/fix_alpha_border=false
process/premult_alpha=false
detect_3d/compress_to=0
```

## 音訊匯入

### 音效（SFX）
```
Import As: WAV (短音效 < 5秒)
Loop: Off
Force 8 Bit: 視品質需求
Trim Silence: On
Normalize: On
```

### 背景音樂（BGM）
```
Import As: OGG Vorbis (長音軌 > 5秒)
Loop: On
Loop Offset: 設定循環點
Quality: 0.5-0.7 (平衡品質與體積)
```

### 決策表
| 時長 | 格式 | 理由 |
|---|---|---|
| < 2 秒 | WAV | 低延遲，適合即時音效 |
| 2-10 秒 | WAV 或 OGG | 依記憶體預算決定 |
| > 10 秒 | OGG Vorbis | 串流解碼，節省記憶體 |
| > 60 秒 | OGG + Stream | 音樂必須串流 |

## 3D 模型匯入

### glTF 2.0（推薦格式）
```
Root Type: Node3D (或 specific)
Root Name: 從檔案名自動
Animation/Import: On
Animation/FPS: 30
Meshes/Ensure Tangents: On (for normal maps)
Meshes/Generate Lightmap UV2: On (if using baked lighting)
```

### FBX（Legacy 支援）
```
# Godot 4.x 建議使用 glTF
# FBX 需要 FBX2glTF 轉換器
```

### 匯入後處理
- 設定碰撞形狀：命名含 `-col` 自動生成
- LOD 設定：命名含 `-lod0`, `-lod1`, `-lod2`
- 動畫拆分：在 Import 面板指定剪輯範圍

## 字體資源

### 匯入設定
```
Antialiasing: LCD Subpixel (桌面) / Grayscale (行動裝置)
Multichannel Signed Distance Field: On (需要縮放時)
Hinting: Full (小字體) / Light (大字體)
Subpixel Positioning: Auto
```

### 像素字體
```
Antialiasing: None
Hinting: None
Subpixel Positioning: Disabled
Force Autohinter: Off
```

## 資源夾結構建議

```
res://
├── assets/
│   ├── sprites/          # 2D 圖片
│   ├── textures/         # 3D 紋理
│   ├── models/           # 3D 模型 (.glb, .gltf)
│   ├── audio/
│   │   ├── sfx/          # 音效
│   │   └── music/        # 音樂
│   ├── fonts/            # 字體檔
│   └── shaders/          # Shader 檔案
├── scenes/
│   ├── levels/           # 關卡場景
│   ├── characters/       # 角色場景
│   ├── ui/               # UI 場景
│   └── components/       # 可重用元件場景
├── scripts/
│   ├── characters/
│   ├── systems/
│   ├── ui/
│   └── resources/        # 自定義 Resource 類別
├── resources/            # .tres 資源實例
│   ├── items/
│   ├── abilities/
│   └── dialogues/
└── autoloads/            # 全局腳本
```

## 資源驗證檢查清單

- [ ] 所有紋理尺寸為 2 的冪次（2D 可例外）
- [ ] 未使用的資源已移除
- [ ] 無循環引用（Scene A 引用 Scene B 引用 Scene A）
- [ ] 大型紋理已壓縮（不超過 2048x2048 on mobile）
- [ ] 音訊檔案使用正確格式（短→WAV，長→OGG）
- [ ] 所有 .import 檔案已加入版本控制
- [ ] 無重複資源（同一張圖不同路徑）
