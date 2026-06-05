/**
 * TileMapManager — Manages TileMap/TileSet configuration
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html
 */

export interface TileSetConfig {
  tileSize: { x: number; y: number };
  sources: TileSetSource[];
  physicsLayers: PhysicsLayerConfig[];
  navigationLayers: NavigationLayerConfig[];
  terrainSets: TerrainSetConfig[];
}

export interface TileSetSource {
  id: number;
  texturePath: string;
  regionSize: { x: number; y: number };
  separation?: { x: number; y: number };
  margin?: { x: number; y: number };
}

export interface PhysicsLayerConfig {
  name: string;
  collisionLayer: number;
  collisionMask: number;
  oneWay: boolean;
}

export interface NavigationLayerConfig {
  name: string;
  layers: number;
}

export interface TerrainSetConfig {
  name: string;
  mode: 'match_corners_and_sides' | 'match_corners' | 'match_sides';
  terrains: Array<{ name: string; color: string }>;
}

export class TileMapManager {
  /**
   * Generate a TileSet resource (.tres) from configuration.
   */
  generateTileSetResource(config: TileSetConfig): string {
    const lines: string[] = [];

    lines.push('[gd_resource type="TileSet" format=3]');
    lines.push('');
    lines.push('[resource]');
    lines.push(`tile_size = Vector2i(${config.tileSize.x}, ${config.tileSize.y})`);

    // Physics layers
    for (let i = 0; i < config.physicsLayers.length; i++) {
      const layer = config.physicsLayers[i];
      lines.push(`physics_layer_${i}/collision_layer = ${layer.collisionLayer}`);
      lines.push(`physics_layer_${i}/collision_mask = ${layer.collisionMask}`);
      if (layer.oneWay) {
        lines.push(`physics_layer_${i}/one_way = true`);
      }
    }

    // Navigation layers
    for (let i = 0; i < config.navigationLayers.length; i++) {
      const layer = config.navigationLayers[i];
      lines.push(`navigation_layer_${i}/layers = ${layer.layers}`);
    }

    // Terrain sets
    for (let i = 0; i < config.terrainSets.length; i++) {
      const ts = config.terrainSets[i];
      lines.push(`terrain_set_${i}/mode = ${this._terrainModeToInt(ts.mode)}`);
      for (let j = 0; j < ts.terrains.length; j++) {
        lines.push(`terrain_set_${i}/terrain_${j}/name = "${ts.terrains[j].name}"`);
        lines.push(`terrain_set_${i}/terrain_${j}/color = Color(${ts.terrains[j].color})`);
      }
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Validate TileSet configuration.
   */
  validateConfig(config: TileSetConfig): string[] {
    const errors: string[] = [];

    if (config.tileSize.x <= 0 || config.tileSize.y <= 0) {
      errors.push('Tile size must be positive');
    }

    if (config.tileSize.x % 2 !== 0 || config.tileSize.y % 2 !== 0) {
      errors.push('Tile size should be a power of 2 or even number for best alignment');
    }

    for (const source of config.sources) {
      if (!source.texturePath) {
        errors.push(`Source ${source.id} missing texture path`);
      }
    }

    return errors;
  }

  private _terrainModeToInt(mode: TerrainSetConfig['mode']): number {
    switch (mode) {
      case 'match_corners_and_sides': return 0;
      case 'match_corners': return 1;
      case 'match_sides': return 2;
    }
  }
}
