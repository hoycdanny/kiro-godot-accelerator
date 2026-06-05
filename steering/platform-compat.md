# Platform Compatibility — Steering File

## English Summary
Covers Godot 4.x cross-platform export: renderer selection, GPU requirements, memory budgets,
export presets, platform-specific limitations, and compatibility checking strategies.

## Official References
- Exporting Projects: https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html
- Feature Tags: https://docs.godotengine.org/en/stable/tutorials/export/feature_tags.html
- Multiple Resolutions: https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html
- Compatibility Renderer: https://docs.godotengine.org/en/stable/tutorials/rendering/introduction_to_rendering.html
- Command Line Export: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html

---

## 渲染器選擇

### Godot 4.x 三種渲染器

| 渲染器 | 適用平台 | GPU 需求 | 特色 |
|---|---|---|---|
| Forward+ | Desktop, Console | Vulkan 1.2+ / D3D12 | 完整 3D 特效、GI、SSR、SSAO |
| Mobile | Mobile, Low-end Desktop | Vulkan 1.0 / OpenGL ES 3.0 | 精簡 3D、適合手機 |
| Compatibility | Web, Old hardware | OpenGL 3.3 / WebGL 2.0 | 最廣泛相容性、2D 最佳選擇 |

### 選擇決策
```
目標平台？
├── 僅 Desktop + Console → Forward+
├── 包含 Mobile → Mobile renderer
├── 包含 Web → Compatibility renderer
├── 僅 2D 遊戲 → Compatibility（效能最佳）
└── 需要最大相容性 → Compatibility
```

## 平台記憶體預算

| 平台 | 建議記憶體上限 | 紋理預算 | 注意事項 |
|---|---|---|---|
| Windows/Linux | 2-4 GB | 1-2 GB | 相對寬裕 |
| macOS | 2-4 GB | 1-2 GB | Metal backend |
| Android (Low) | 512 MB | 256 MB | Mali GPU 限制多 |
| Android (High) | 1-2 GB | 512 MB | Adreno/Mali 高端 |
| iOS | 1-2 GB | 512 MB | 嚴格記憶體管理 |
| Web | 256-512 MB | 128-256 MB | WASM 堆積限制 |
| Nintendo Switch | 3 GB | 1.5 GB | 固定硬體 |

## Export Presets 設定

### Windows
```ini
[preset.windows]
platform = "Windows Desktop"
runnable = true
custom_features = ""
export_filter = "all_resources"
include_filter = ""
exclude_filter = ""
# 建議 x86_64，Godot 4.x 已放棄 32-bit
architecture = "x86_64"
```

### Web (HTML5)
```ini
[preset.web]
platform = "Web"
runnable = true
# 注意：SharedArrayBuffer 需要 HTTPS + COOP/COEP headers
# 沒有這些 headers，多執行緒會降級
vram_texture_compression/for_desktop = true
vram_texture_compression/for_mobile = true
```

### Android
```ini
[preset.android]
platform = "Android"
min_sdk = 24          # Android 7.0+
target_sdk = 34       # 最新穩定
# 需要設定 keystore 簽名
keystore/debug = "user://debug.keystore"
architectures/arm64_v8a = true
architectures/armeabi_v7a = false  # 棄用 32-bit
```

### iOS
```ini
[preset.ios]
platform = "iOS"
min_ios_version = "15.0"
# 需要 Apple Developer 帳號
# 需要 macOS + Xcode 進行簽名
```

## 命令列匯出

```bash
# Windows Release
godot --headless --export-release "Windows Desktop" builds/windows/game.exe

# Web Release
godot --headless --export-release "Web" builds/web/index.html

# Android APK
godot --headless --export-release "Android" builds/android/game.apk

# Debug 版本（含偵錯資訊）
godot --headless --export-debug "Windows Desktop" builds/debug/game.exe
```

## 平台特定限制

### Web
- 無法存取本地檔案系統（使用 `user://`）
- SharedArrayBuffer 需要安全上下文
- 最大 WASM 記憶體 2-4 GB（瀏覽器限制）
- 不支援 GDExtension（native plugins）
- 音訊需要使用者互動才能播放

### Android
- 需要處理 Activity 生命週期
- 權限系統（檔案、網路、相機等）
- 不同 GPU 架構（Adreno, Mali, PowerVR）
- APK 大小限制（Play Store: 200 MB）
- 注意 thermal throttling

### iOS
- 必須從 macOS 建置
- App Store 審核限制
- 無 JIT 編譯（影響部分 GDScript 優化）
- 嚴格記憶體管理（系統會強制終止）
- 需要處理 Safe Area（瀏海/圓角）

### macOS
- 需要 notarization（公證）
- Universal Binary 支援（Intel + Apple Silicon）
- Sandbox 限制

## 相容性檢查清單

- [ ] 選擇的渲染器支持所有目標平台
- [ ] Shader 功能不超出目標 GPU 能力
- [ ] 紋理壓縮格式涵蓋所有平台（VRAM Compressed 自動處理）
- [ ] 記憶體使用量在預算內
- [ ] 觸控/鍵盤/手把輸入都有對應映射
- [ ] 螢幕解析度與比例適配
- [ ] 音訊格式相容（WAV 通用、OGG 跨平台）
- [ ] 字體包含目標語言字元集
- [ ] 網路功能在目標平台可用
- [ ] 無使用平台不支持的 API（如 Web 無 Thread）
