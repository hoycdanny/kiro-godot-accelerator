# Networking / Multiplayer — Steering File

## English Summary
Covers Godot 4.x multiplayer: High-level multiplayer API, MultiplayerSpawner,
MultiplayerSynchronizer, RPC patterns, authority model, and dedicated server architecture.

## Official References
- High-level Multiplayer: https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html
- MultiplayerSpawner: https://docs.godotengine.org/en/stable/classes/class_multiplayerspawner.html
- MultiplayerSynchronizer: https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html
- RPC: https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html#remote-procedure-calls

---

## 架構概覽

### Godot 4.x 多人遊戲 API
```
Server (Authority)
├── MultiplayerAPI
├── ENetMultiplayerPeer / WebSocketMultiplayerPeer
├── MultiplayerSpawner (管理物件生成)
└── MultiplayerSynchronizer (管理狀態同步)

Client
├── MultiplayerAPI
├── 接收同步狀態
└── 發送 RPC 請求
```

### 連線建立
```gdscript
# server.gd
func create_server(port: int = 7000, max_clients: int = 10) -> void:
    var peer := ENetMultiplayerPeer.new()
    var error := peer.create_server(port, max_clients)
    if error != OK:
        push_error("Failed to create server: %s" % error_string(error))
        return
    multiplayer.multiplayer_peer = peer
    multiplayer.peer_connected.connect(_on_peer_connected)
    multiplayer.peer_disconnected.connect(_on_peer_disconnected)

# client.gd
func join_server(address: String = "127.0.0.1", port: int = 7000) -> void:
    var peer := ENetMultiplayerPeer.new()
    var error := peer.create_client(address, port)
    if error != OK:
        push_error("Failed to connect: %s" % error_string(error))
        return
    multiplayer.multiplayer_peer = peer
    multiplayer.connected_to_server.connect(_on_connected)
    multiplayer.connection_failed.connect(_on_connection_failed)
```

## RPC 模式

### 注解類型
```gdscript
# 任何人都可以呼叫，所有人都執行
@rpc("any_peer", "call_local", "reliable")
func chat_message(message: String) -> void:
    _display_message(message)

# 只有 Authority 呼叫，所有人執行
@rpc("authority", "call_local", "reliable")
func spawn_enemy(position: Vector3, enemy_type: String) -> void:
    var enemy := _create_enemy(enemy_type)
    enemy.position = position
    add_child(enemy)

# 客戶端請求，server 驗證
@rpc("any_peer", "call_local", "reliable")
func request_action(action_data: Dictionary) -> void:
    if not multiplayer.is_server():
        return
    # Server 端驗證
    if _validate_action(multiplayer.get_remote_sender_id(), action_data):
        _execute_action.rpc(action_data)
```

### RPC 可靠性
| 模式 | 用途 | 範例 |
|---|---|---|
| reliable | 必須送達 | 物件生成、聊天訊息、狀態改變 |
| unreliable | 可以丟失 | 位置更新、動畫狀態 |
| unreliable_ordered | 有序但可丟 | 連續位置同步 |

## MultiplayerSpawner

### 設定
```
Level (Node3D)
├── MultiplayerSpawner
│   ├── Spawn Path: ../Players
│   └── Auto Spawn List: [player.tscn]
├── Players (Node3D)    ← 生成的玩家放在這裡
└── World (Node3D)
```

```gdscript
# 動態生成
@onready var spawner: MultiplayerSpawner = $MultiplayerSpawner

func _on_peer_connected(id: int) -> void:
    if not multiplayer.is_server():
        return
    var player := PlayerScene.instantiate()
    player.name = str(id)
    $Players.add_child(player)
```

## MultiplayerSynchronizer

### 狀態同步設定
```gdscript
# player.gd
extends CharacterBody3D

# 這些屬性會自動同步到所有 peer
@export var synced_position: Vector3
@export var synced_rotation: float
@export var synced_health: int = 100

# MultiplayerSynchronizer 設定：
# Replication Config:
#   synced_position → Always (unreliable)
#   synced_rotation → Always (unreliable)
#   synced_health → On Change (reliable)
```

## 權限模型（Authority）

### 設計原則
- Server 是唯一的 Authority（防作弊）
- Client 發送「意圖」而非「結果」
- Server 驗證所有操作

```gdscript
# 客戶端：發送輸入意圖
func _physics_process(_delta: float) -> void:
    if not is_multiplayer_authority():
        return
    var input_vector := Input.get_vector("left", "right", "up", "down")
    _send_input.rpc_id(1, input_vector)  # 送到 server

# Server：驗證並執行
@rpc("any_peer", "reliable")
func _send_input(input: Vector2) -> void:
    if not multiplayer.is_server():
        return
    var sender_id := multiplayer.get_remote_sender_id()
    _apply_movement(sender_id, input)
```

## 專用伺服器（Dedicated Server）

### Headless 匯出
```bash
# 匯出不含渲染的伺服器版本
godot --headless --export-release "Linux Server" builds/server/game_server
```

### 伺服器啟動
```gdscript
func _ready() -> void:
    if OS.has_feature("dedicated_server") or DisplayServer.get_name() == "headless":
        _start_dedicated_server()

func _start_dedicated_server() -> void:
    var port := OS.get_cmdline_user_args().get(0, "7000").to_int()
    create_server(port)
    print("Server started on port %d" % port)
```
