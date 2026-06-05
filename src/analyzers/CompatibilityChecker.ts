/**
 * CompatibilityChecker — Validates cross-platform compatibility for Godot projects
 *
 * Checks renderer requirements, shader features, memory budgets,
 * and API availability per target platform.
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html
 */

export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web';
export type Renderer = 'forward_plus' | 'mobile' | 'compatibility';

export interface CompatIssue {
  platform: Platform;
  severity: 'error' | 'warning' | 'suggestion';
  category: 'renderer' | 'shader' | 'memory' | 'api' | 'feature';
  message: string;
  fix: string;
}

export interface PlatformProfile {
  platform: Platform;
  supportedRenderers: Renderer[];
  maxTextureSize: number;
  memoryBudgetMB: number;
  supportsThreads: boolean;
  supportsGDExtension: boolean;
  supportsComputeShaders: boolean;
  notes: string[];
}

const PLATFORM_PROFILES: Record<Platform, PlatformProfile> = {
  windows: {
    platform: 'windows',
    supportedRenderers: ['forward_plus', 'mobile', 'compatibility'],
    maxTextureSize: 8192,
    memoryBudgetMB: 4096,
    supportsThreads: true,
    supportsGDExtension: true,
    supportsComputeShaders: true,
    notes: ['Full feature support', 'Vulkan 1.2+ for Forward+'],
  },
  macos: {
    platform: 'macos',
    supportedRenderers: ['forward_plus', 'mobile', 'compatibility'],
    maxTextureSize: 8192,
    memoryBudgetMB: 4096,
    supportsThreads: true,
    supportsGDExtension: true,
    supportsComputeShaders: true,
    notes: ['Uses MoltenVK (Vulkan over Metal)', 'Notarization required for distribution'],
  },
  linux: {
    platform: 'linux',
    supportedRenderers: ['forward_plus', 'mobile', 'compatibility'],
    maxTextureSize: 8192,
    memoryBudgetMB: 4096,
    supportsThreads: true,
    supportsGDExtension: true,
    supportsComputeShaders: true,
    notes: ['Native Vulkan support', 'Steam Deck compatible'],
  },
  android: {
    platform: 'android',
    supportedRenderers: ['mobile', 'compatibility'],
    maxTextureSize: 2048,
    memoryBudgetMB: 1024,
    supportsThreads: true,
    supportsGDExtension: true,
    supportsComputeShaders: false,
    notes: [
      'Forward+ NOT supported',
      'Diverse GPU architectures (Adreno, Mali, PowerVR)',
      'Thermal throttling affects sustained performance',
      'APK size limit: 200 MB (Play Store)',
    ],
  },
  ios: {
    platform: 'ios',
    supportedRenderers: ['mobile', 'compatibility'],
    maxTextureSize: 4096,
    memoryBudgetMB: 1536,
    supportsThreads: true,
    supportsGDExtension: true,
    supportsComputeShaders: false,
    notes: [
      'Forward+ NOT supported',
      'Must build from macOS',
      'Strict memory management (system kills apps)',
      'No JIT compilation',
    ],
  },
  web: {
    platform: 'web',
    supportedRenderers: ['compatibility'],
    maxTextureSize: 2048,
    memoryBudgetMB: 512,
    supportsThreads: false,
    supportsGDExtension: false,
    supportsComputeShaders: false,
    notes: [
      'Only Compatibility renderer',
      'No GDExtension (native plugins)',
      'SharedArrayBuffer needs COOP/COEP headers',
      'WASM memory limit ~2-4 GB',
      'Audio requires user interaction to start',
    ],
  },
};

export class CompatibilityChecker {
  /**
   * Get platform profile information.
   */
  getProfile(platform: Platform): PlatformProfile {
    return PLATFORM_PROFILES[platform];
  }

  /**
   * Check renderer compatibility for target platforms.
   */
  checkRenderer(renderer: Renderer, targets: Platform[]): CompatIssue[] {
    const issues: CompatIssue[] = [];

    for (const platform of targets) {
      const profile = PLATFORM_PROFILES[platform];
      if (!profile.supportedRenderers.includes(renderer)) {
        issues.push({
          platform,
          severity: 'error',
          category: 'renderer',
          message: `'${renderer}' renderer is not supported on ${platform}`,
          fix: `Use '${profile.supportedRenderers[0]}' renderer for ${platform} builds`,
        });
      }
    }

    return issues;
  }

  /**
   * Check memory budget against estimated usage.
   */
  checkMemoryBudget(
    estimatedMB: number,
    targets: Platform[]
  ): CompatIssue[] {
    const issues: CompatIssue[] = [];

    for (const platform of targets) {
      const profile = PLATFORM_PROFILES[platform];
      if (estimatedMB > profile.memoryBudgetMB) {
        issues.push({
          platform,
          severity: 'error',
          category: 'memory',
          message: `Estimated ${estimatedMB} MB exceeds ${platform} budget of ${profile.memoryBudgetMB} MB`,
          fix: 'Reduce texture sizes, use streaming, or lower quality settings for this platform',
        });
      } else if (estimatedMB > profile.memoryBudgetMB * 0.8) {
        issues.push({
          platform,
          severity: 'warning',
          category: 'memory',
          message: `Estimated ${estimatedMB} MB is ${Math.round((estimatedMB / profile.memoryBudgetMB) * 100)}% of ${platform} budget`,
          fix: 'Consider optimizing for headroom — mobile platforms may spike unexpectedly',
        });
      }
    }

    return issues;
  }

  /**
   * Check feature availability across platforms.
   */
  checkFeatures(
    usesThreads: boolean,
    usesGDExtension: boolean,
    usesComputeShaders: boolean,
    targets: Platform[]
  ): CompatIssue[] {
    const issues: CompatIssue[] = [];

    for (const platform of targets) {
      const profile = PLATFORM_PROFILES[platform];

      if (usesThreads && !profile.supportsThreads) {
        issues.push({
          platform,
          severity: 'error',
          category: 'feature',
          message: `Threading not supported on ${platform}`,
          fix: 'Provide single-threaded fallback or remove thread dependency',
        });
      }

      if (usesGDExtension && !profile.supportsGDExtension) {
        issues.push({
          platform,
          severity: 'error',
          category: 'feature',
          message: `GDExtension (native plugins) not supported on ${platform}`,
          fix: 'Implement equivalent functionality in GDScript or exclude this platform',
        });
      }

      if (usesComputeShaders && !profile.supportsComputeShaders) {
        issues.push({
          platform,
          severity: 'error',
          category: 'feature',
          message: `Compute shaders not supported on ${platform}`,
          fix: 'Provide CPU fallback or use particle shaders instead',
        });
      }
    }

    return issues;
  }

  /**
   * Run all compatibility checks for a project.
   */
  fullCheck(config: {
    renderer: Renderer;
    targets: Platform[];
    estimatedMemoryMB: number;
    usesThreads: boolean;
    usesGDExtension: boolean;
    usesComputeShaders: boolean;
  }): CompatIssue[] {
    return [
      ...this.checkRenderer(config.renderer, config.targets),
      ...this.checkMemoryBudget(config.estimatedMemoryMB, config.targets),
      ...this.checkFeatures(
        config.usesThreads,
        config.usesGDExtension,
        config.usesComputeShaders,
        config.targets
      ),
    ];
  }
}
