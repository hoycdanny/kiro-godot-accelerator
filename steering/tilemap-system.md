# TileMap System — Steering File

## English Summary
Covers Godot 4.x TileMap/TileSet system: TileMapLayer, atlas sources, terrain sets,
physics/navigation layers, and tile painting patterns.

## Official References
- TileMap: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html
- TileSet: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html
- Terrain: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html#defining-terrain-sets

---

## Godot 4.x TileMap 架構

### 節點結構（4.3+）
```
Level (Node2D)
├── TileMapLayer (Background, z_index=-1)
├── TileMapLayer (Terrain, z_index=0)
├── TileMapLayer (Foreground, z_index=1)
└── TileMapLayer (Collision, z_index=0, visible=false)
```

> 注意：Godot 4.3+ 使用 TileMapLayer 節點取代舊的 TileMap 多層系統

### TileSet Resource 設定
```
TileSet (.tres)
├── Atlas Source 0 (tileset_ground.png)
│   ├── Tile (0,0) — grass
│   ├── Tile (1,0) — dirt
│   └── Tile (2,0) — stone
├── Atlas Source 1 (tileset_props.png)
│   ├── Tile (0,0) — tree
│   └── Tile (1,0) — rock
├── Physics Layer 0 — solid (collision)
├── Physics Layer 1 — one-way platform
├── Navigation Layer 0 — walkable
└── Terrain Set 0 — auto-tiling
```

## Atlas Source 設定

### 紋理圖集配置
```gdscript
# 程式化設定 TileSet
var tileset := TileSet.new()
tileset.tile_size = Vector2i(16, 16)  # 或 32x32, 64x64

# 添加紋理圖集
var source := TileSetAtlasSource.new()
source.texture = preload("res://assets/tilesets/ground.png")
source.texture_region_size = Vector2i(16, 16)
tileset.add_source(source)
```

### 建議的 Tile 尺寸
| 遊戲風格 | Tile 大小 | 理由 |
|---|---|---|
| 像素復古 | 8x8 或 16x16 | 經典像素風格 |
| 標準 2D | 32x32 或 48x48 | 平衡細節與效能 |
| HD 2D | 64x64 或 128x128 | 高解析度適用 |
| 等距視角 | 64x32 | 2:1 等距比例 |

## Terrain Sets（自動拼接）

### Terrain 模式
- **Match Corners and Sides** — 完整 47-tile blob tileset
- **Match Corners** — 僅角落匹配（13 tiles）
- **Match Sides** — 僅邊緣匹配（16 tiles）

### 設定步驟
1. TileSet → 新增 Terrain Set
2. 定義 Terrain 類型（ground, wall, water）
3. 為每個 Tile 標記 Terrain 連接點
4. 使用 Terrain 筆刷自動繪製

```gdscript
# 程式化使用 Terrain
var tile_map_layer: TileMapLayer = $TerrainLayer

# 設定 terrain 連接
func _place_terrain_path(cells: Array[Vector2i]) -> void:
    tile_map_layer.set_cells_terrain_connect(cells, 0, 0)  # terrain_set=0, terrain=0
```

## Physics Layers

### 碰撞設定
```
Physics Layer 0: "Solid"
  - Collision Layer: 1
  - Collision Mask: 1
  - 用途: 不可通行地形

Physics Layer 1: "One-Way"
  - One Way: true
  - 用途: 可從下方跳上的平台

Physics Layer 2: "Hazard"
  - Collision Layer: 4
  - 用途: 傷害區域（刺、岩漿）
```

### Navigation Layers
```
Navigation Layer 0: "Walkable"
  - 用途: AI 可行走的地面
  - 不包含: 牆壁、深水、懸崖
```

## 程式化操作 TileMap

```gdscript
var tile_map_layer: TileMapLayer = $TerrainLayer

# 放置 tile
func place_tile(grid_pos: Vector2i, source_id: int, atlas_coords: Vector2i) -> void:
    tile_map_layer.set_cell(grid_pos, source_id, atlas_coords)

# 清除 tile
func clear_tile(grid_pos: Vector2i) -> void:
    tile_map_layer.erase_cell(grid_pos)

# 世界座標 → Grid 座標
func world_to_grid(world_pos: Vector2) -> Vector2i:
    return tile_map_layer.local_to_map(tile_map_layer.to_local(world_pos))

# Grid 座標 → 世界座標
func grid_to_world(grid_pos: Vector2i) -> Vector2:
    return tile_map_layer.to_global(tile_map_layer.map_to_local(grid_pos))

# 取得指定位置的 tile 資訊
func get_tile_data(grid_pos: Vector2i) -> TileData:
    return tile_map_layer.get_cell_tile_data(grid_pos)
```

## 效能建議

- 使用多個 TileMapLayer 分離靜態與動態內容
- 靜態地形圖層設為不可修改以啟用批次渲染
- 避免超大 TileMap（>1000x1000）— 使用分區載入
- Tile 動畫使用 TileSet 內建動畫功能而非手動切換
- Y-Sort 需求時啟用 TileMapLayer 的 y_sort_enabled
