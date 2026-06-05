# MCP Workflow — Steering File

## English Summary
Covers MCP (Model Context Protocol) best practices when working with Godot via godot-mcp:
tool call sequencing, verify-before-act patterns, error handling, project path validation, and retry strategies.

## Official References
- MCP Specification: https://modelcontextprotocol.io/introduction
- godot-mcp: https://github.com/bradypp/godot-mcp
- Godot CLI: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html

---

## 工具呼叫順序

### 啟動流程
1. `get_godot_version` — 確認 Godot 已安裝且可存取
2. `get_project_info` — 確認專案路徑有效
3. 執行目標操作

### 場景建立流程
1. `get_project_info` — 確認專案存在
2. `create_scene` — 建立新場景
3. `add_node` — 添加節點（可多次）
4. `edit_node` — 設定節點屬性
5. `save_scene` — 儲存場景

### 除錯流程
1. `run_project` — 執行專案
2. `get_debug_output` — 取得輸出/錯誤
3. 分析問題
4. `stop_project` — 停止執行

## Verify-Before-Act 模式

### 原則
在執行破壞性或不可逆操作前，先驗證目標存在：

```
# 修改節點前
1. get_project_info → 確認專案路徑
2. 確認場景路徑存在
3. edit_node / remove_node

# 建立場景前
1. get_project_info → 確認不會覆蓋現有檔案
2. create_scene
```

### 路徑驗證
- 所有 `projectPath` 必須是絕對路徑
- 所有 `scenePath` 相對於專案根目錄
- 確認路徑包含 `project.godot`
- Windows 使用 `\\` 或 `/`（godot-mcp 均支援）

## 錯誤處理

### 常見錯誤與恢復

| 錯誤 | 原因 | 解決方案 |
|---|---|---|
| "Could not find Godot executable" | GODOT_PATH 未設定 | 設定環境變數或 mcp.json |
| "Invalid project path" | 路徑不含 project.godot | 檢查路徑是否正確 |
| "Scene file not found" | scenePath 不存在 | 先 create_scene 或檢查路徑 |
| "Node not found" | nodePath 錯誤 | 確認節點名稱與路徑 |
| "Process already running" | 有專案正在執行 | 先 stop_project |

### 重試策略
- 路徑錯誤 → 不重試，修正路徑
- 連線逾時 → 最多重試 2 次，間隔 2 秒
- 節點操作失敗 → 確認場景已載入後重試 1 次
- Godot 崩潰 → 停止操作，報告錯誤

## 批次操作最佳實踐

### 建立複雜場景
```
# 按照場景樹順序添加節點（父節點優先）
1. create_scene (root: Node2D)
2. add_node (Sprite2D, parent=root)
3. add_node (CollisionShape2D, parent=root)
4. add_node (Camera2D, parent=root)
5. edit_node (設定各節點屬性)
6. save_scene
```

### 注意事項
- 每次 add_node 都會修改場景檔，頻繁操作可能較慢
- 對於複雜場景，考慮直接生成 .tscn 文字檔
- 不要在 run_project 期間修改場景（可能衝突）

## MCP 安全考量

### READ_ONLY 模式
適用情境：
- CI/CD 管道中的專案分析
- 程式碼審查
- 教學環境

### 不允許的操作（READ_ONLY 下）
- create_scene
- add_node / edit_node / remove_node
- load_sprite
- save_scene
- export_mesh_library
- update_project_uids

### 本地通訊安全
- godot-mcp 僅在本機執行（stdio 模式）
- 不監聽網路端口
- 不傳輸任何資料到外部
