# Kiro Godot Accelerator

[English](README.md) | [繁體中文](README_TW.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> **語言說明：** Steering 文件（領域知識）以繁體中文撰寫，頂部附英文摘要。Power 會以開發者偏好的語言回應。

將你的 IDE 轉變為 Godot Engine 開發 AI 助手。使用自然語言透過 MCP（Model Context Protocol）指揮 Godot Editor。本 Power 涵蓋場景管理、GDScript 生成、資源管線、建置自動化、效能分析、程式碼品質檢查、Shader 工作流程等功能 — 搭配 16+ MCP 工具與 13 份領域知識文件。

> **核心概念：**
>
> • **MCP（Model Context Protocol）：** AI 助手與開發工具通訊的標準化協議  
> • **Scene（場景）：** Godot 的基本建構單元 — 節點樹存為可重用檔案（.tscn）  
> • **Node（節點）：** 場景樹的基本單位；Godot 中一切皆繼承 Node  
> • **Signal（信號）：** 實作觀察者模式的解耦節點通訊機制  
> • **GDScript：** Godot 內建腳本語言，具 Python 風格語法與靜態型別支援  
> • **Resource（資源）：** Godot 從磁碟存取的所有資料（.tres、紋理、音訊等）

## 功能特色

- **場景管理** — 建立、修改、儲存場景；從 6 個腳手架模板生成完整場景結構
- **GDScript 生成** — 型別安全腳本，含信號、匯出變數、狀態機、組件模式
- **資源管線** — 匯入預設、未使用資源偵測、引用驗證、格式優化
- **建置自動化** — 多平台匯出（Windows/macOS/Linux/Web/Android/iOS），headless CLI 建置
- **效能分析** — 12 項反模式偵測、幀預算分析、記憶體分析
- **程式碼品質** — 命名規範強制、信號耦合度分析、循環相依偵測
- **Shader 工作流程** — 文字 & VisualShader 模板、平台相容性驗證
- **TileMap 工具** — TileSet 設定、Terrain sets、物理/導航層
- **動畫系統** — AnimationTree 狀態機、BlendTree 設定、Tween 模式
- **UI 系統** — Control 層級架構、Theme 生成、響應式佈局、無障礙設計
- **Signal 架構** — Event Bus 模式、耦合度圖表、解耦通訊
- **多人連線** — RPC 模式、MultiplayerSpawner/Synchronizer、專用伺服器設定

## 架構

```
開發者（自然語言）
    → AI 層（意圖理解與規劃）
        → MCP 協議
            → Godot Editor（執行層）

Godot Accelerator（智能層）
├── POWER.md        → 定義工具與工作流程的主文件
├── steering/       → 13 份領域知識文件
├── templates/      → 30+ JSON 模板（7 大類）
└── src/            → 12 個 TypeScript 分析模組
```

## 前置需求

- [Godot Engine 4.3+](https://godotengine.org/download/)（建議 4.4+ 以支援 UID）
- [Kiro IDE](https://kiro.dev/docs/getting-started/installation)
- [Node.js 18+](https://nodejs.org/) 與 npm
- [godot-mcp](https://github.com/bradypp/godot-mcp) 已 clone 並 build

## 安裝步驟

### 步驟 1 — 在 Kiro 安裝此 Power

開啟 Kiro → 左側面板點擊 Powers 圖示 → 點擊「+」→ 選擇「Add Custom Power」→ 選擇本專案根目錄

### 步驟 2 — 安裝並建置 godot-mcp

```bash
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp
npm install
npm run build
```

### 步驟 3 — 設定 MCP 連線

編輯 `mcp.json` 或 `.kiro/settings/mcp.json`：

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\<你的使用者名稱>\\path\\to\\godot-mcp\\build\\index.js"],
      "env": {
        "GODOT_PATH": "C:\\Program Files\\Godot\\Godot_v4.4-stable_win64.exe",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

### 步驟 4 — 安裝自動導引 Hook（建議）

```bash
mkdir -p .kiro/hooks
cp hooks/pre-godot-tool.kiro.hook .kiro/hooks/
```

### 驗證連線

在 Kiro 中輸入任何 Godot 相關指令（例如「顯示目前安裝的 Godot 版本」）。如果 AI 正確回應，連線即成功。

## 使用方式

安裝完成後，直接用自然語言跟 Kiro 對話。AI 會自動啟用 Power、選擇正確的 MCP 工具並執行操作。

### 你可以這樣問

| 領域 | 範例指令 |
|------|----------|
| 場景 | 「建立一個 2D 平台遊戲場景」、「幫我建一個主選單 UI」 |
| GDScript | 「產生一個含狀態機的玩家控制器」、「建立 Event Bus 單例」 |
| 資源 | 「檢查未使用的資源」、「設定像素風格匯入預設」 |
| 效能 | 「掃描效能反模式」、「產生優化報告」 |
| 品質 | 「檢查命名規範」、「分析信號耦合度」 |
| Shader | 「建立精靈外框 Shader」、「做一個溶解特效」 |
| 建置 | 「匯出 Windows 版本」、「建置 Web 版」 |
| 平台 | 「我的專案相容 iOS 嗎？」、「檢查行動裝置記憶體預算」 |

## 官方 Godot 文件參考

本 Power 的領域知識完全基於官方文件：

| 領域 | 官方文件連結 |
|------|-------------|
| GDScript 風格 | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html |
| 靜態型別 | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html |
| 場景組織 | https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html |
| 信號系統 | https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html |
| 效能最佳實踐 | https://docs.godotengine.org/en/stable/tutorials/performance/index.html |
| 匯出專案 | https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html |
| Shader | https://docs.godotengine.org/en/stable/tutorials/shaders/index.html |
| AnimationTree | https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html |
| TileMap | https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html |
| 多人連線 | https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html |
| UI/Control | https://docs.godotengine.org/en/stable/tutorials/ui/index.html |
| 資源匯入 | https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html |
| 專案組織 | https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html |
| 命令列參考 | https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html |

## 疑難排解

| 問題 | 解決方案 |
|------|----------|
| 「找不到 Godot 執行檔」 | 在 mcp.json 設定 `GODOT_PATH` 環境變數 |
| MCP 工具無回應 | 確認 godot-mcp 已 build（`npm run build`），路徑正確 |
| 「無效的專案路徑」 | 提供包含 `project.godot` 的絕對路徑 |
| UID 工具無法使用 | 需要 Godot 4.4+；更早版本使用 `res://` 路徑 |

## 授權

MIT License。詳見 [LICENSE](LICENSE) 檔案。
