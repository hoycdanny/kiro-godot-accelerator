/**
 * AssetAnalyzer — Validates Godot project asset integrity
 *
 * Scans for unused assets, validates import configurations,
 * checks resource references, and detects duplicates.
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html
 */

export interface AssetInfo {
  path: string;
  type: 'texture' | 'audio' | 'scene' | 'script' | 'shader' | 'resource' | 'font' | 'model' | 'unknown';
  size?: number;
  referenced: boolean;
}

export interface AssetIssue {
  type: 'unused' | 'missing_reference' | 'oversized' | 'wrong_format' | 'duplicate';
  severity: 'error' | 'warning' | 'suggestion';
  file: string;
  message: string;
  fix: string;
}

export interface AssetReport {
  totalAssets: number;
  unusedAssets: string[];
  issues: AssetIssue[];
  byType: Record<string, number>;
}

const EXTENSION_TYPE_MAP: Record<string, AssetInfo['type']> = {
  '.png': 'texture',
  '.jpg': 'texture',
  '.jpeg': 'texture',
  '.webp': 'texture',
  '.svg': 'texture',
  '.bmp': 'texture',
  '.wav': 'audio',
  '.ogg': 'audio',
  '.mp3': 'audio',
  '.tscn': 'scene',
  '.scn': 'scene',
  '.gd': 'script',
  '.gdshader': 'shader',
  '.tres': 'resource',
  '.res': 'resource',
  '.ttf': 'font',
  '.otf': 'font',
  '.woff': 'font',
  '.woff2': 'font',
  '.glb': 'model',
  '.gltf': 'model',
  '.fbx': 'model',
  '.obj': 'model',
};

const MAX_TEXTURE_SIZE_MOBILE = 2048 * 2048 * 4; // 2K texture RGBA
const MAX_TEXTURE_SIZE_DESKTOP = 4096 * 4096 * 4; // 4K texture RGBA

export class AssetAnalyzer {
  /**
   * Detect asset type from file extension.
   */
  detectType(filePath: string): AssetInfo['type'] {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    return EXTENSION_TYPE_MAP[ext] || 'unknown';
  }

  /**
   * Check if a texture exceeds recommended size limits.
   */
  checkTextureSize(
    filePath: string,
    fileSize: number,
    platform: 'desktop' | 'mobile' | 'web' = 'desktop'
  ): AssetIssue | null {
    const maxSize = platform === 'desktop' ? MAX_TEXTURE_SIZE_DESKTOP : MAX_TEXTURE_SIZE_MOBILE;

    if (fileSize > maxSize) {
      return {
        type: 'oversized',
        severity: 'warning',
        file: filePath,
        message: `Texture exceeds ${platform} budget (${(fileSize / 1024 / 1024).toFixed(1)} MB)`,
        fix: `Reduce texture resolution or use compression. Max recommended: ${platform === 'desktop' ? '4096x4096' : '2048x2048'}`,
      };
    }

    return null;
  }

  /**
   * Validate audio format matches usage pattern.
   */
  checkAudioFormat(filePath: string, durationSeconds?: number): AssetIssue | null {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();

    if (ext === '.wav' && durationSeconds && durationSeconds > 10) {
      return {
        type: 'wrong_format',
        severity: 'suggestion',
        file: filePath,
        message: `WAV file is ${durationSeconds}s long — should use OGG Vorbis for files > 10s`,
        fix: 'Convert to .ogg for streaming playback (saves memory)',
      };
    }

    if (ext === '.mp3') {
      return {
        type: 'wrong_format',
        severity: 'suggestion',
        file: filePath,
        message: 'MP3 format has licensing concerns and slightly higher latency than OGG',
        fix: 'Convert to .ogg (Vorbis) for music or .wav for short SFX',
      };
    }

    return null;
  }

  /**
   * Find assets referenced in scene/script files.
   */
  findReferences(content: string): string[] {
    const refs: string[] = [];

    // Match res:// paths
    const resMatches = content.matchAll(/res:\/\/[^\s"')}\]]+/g);
    for (const match of resMatches) {
      refs.push(match[0]);
    }

    // Match preload/load calls
    const loadMatches = content.matchAll(/(?:pre)?load\(\s*"([^"]+)"\s*\)/g);
    for (const match of loadMatches) {
      refs.push(match[1]);
    }

    return [...new Set(refs)];
  }

  /**
   * Generate comprehensive asset report.
   */
  generateReport(
    assets: AssetInfo[],
    issues: AssetIssue[]
  ): AssetReport {
    const byType: Record<string, number> = {};
    const unusedAssets: string[] = [];

    for (const asset of assets) {
      byType[asset.type] = (byType[asset.type] || 0) + 1;
      if (!asset.referenced) {
        unusedAssets.push(asset.path);
      }
    }

    return {
      totalAssets: assets.length,
      unusedAssets,
      issues,
      byType,
    };
  }
}
