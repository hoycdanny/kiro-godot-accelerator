/**
 * PerformanceAnalyzer — Detects common GDScript performance anti-patterns
 *
 * Scans GDScript source files for 12 known anti-patterns that impact
 * frame rate, memory usage, and responsiveness.
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/performance/index.html
 */

export interface PerformanceIssue {
  pattern: string;
  severity: 'error' | 'warning' | 'suggestion';
  file: string;
  line: number;
  description: string;
  fix: string;
}

export interface PerformanceReport {
  totalIssues: number;
  errors: number;
  warnings: number;
  suggestions: number;
  issues: PerformanceIssue[];
  score: number; // 0-100, higher is better
}

/**
 * Anti-pattern definitions with regex detection and fix suggestions.
 */
const ANTI_PATTERNS = [
  {
    id: 'polling_in_process',
    pattern: /func _process\([^)]*\)[^}]*(?:get_node|find_child|get_children)/s,
    severity: 'warning' as const,
    description: 'Node tree query inside _process() — expensive per-frame operation',
    fix: 'Cache node references with @onready or in _ready(), or use signals for event-driven updates',
  },
  {
    id: 'uncached_get_node',
    pattern: /func _(?:process|physics_process)\([^)]*\)[^}]*\$[^\n]+/s,
    severity: 'warning' as const,
    description: 'Accessing node via $ in _process/_physics_process without caching',
    fix: 'Use @onready var node: Type = $Path at the top of the script',
  },
  {
    id: 'string_format_in_process',
    pattern: /func _process\([^)]*\)[^}]*(?:str\(|%|format)/s,
    severity: 'suggestion' as const,
    description: 'String formatting inside _process() — creates garbage each frame',
    fix: 'Only update text when the value actually changes (event-driven)',
  },
  {
    id: 'instantiate_in_loop',
    pattern: /(?:for|while)[^}]*\.instantiate\(\)/s,
    severity: 'warning' as const,
    description: 'Instantiating scenes inside a loop — consider object pooling',
    fix: 'Implement an object pool pattern: pre-create instances and reuse them',
  },
  {
    id: 'missing_static_typing',
    pattern: /var\s+\w+\s*=\s*(?!.*:)/,
    severity: 'suggestion' as const,
    description: 'Variable declared without static type annotation',
    fix: 'Add type annotation: var name: Type = value (enables compiler optimizations)',
  },
  {
    id: 'get_tree_in_process',
    pattern: /func _process\([^)]*\)[^}]*get_tree\(\)\.get_nodes_in_group/s,
    severity: 'warning' as const,
    description: 'Group query every frame — scales poorly with scene size',
    fix: 'Cache group results and refresh on a timer (e.g., every 0.5s)',
  },
  {
    id: 'physics_body_as_trigger',
    pattern: /RigidBody[23]D[\s\S]*(?:monitoring|monitorable)/,
    severity: 'suggestion' as const,
    description: 'Using RigidBody as trigger — Area nodes are cheaper for detection only',
    fix: 'Replace with Area2D/Area3D if physics simulation is not needed',
  },
  {
    id: 'no_visibility_optimization',
    pattern: /func _process\([^)]*\)[\s\S]*(?:position|velocity|move_and_slide)/,
    severity: 'suggestion' as const,
    description: 'Processing logic without visibility check — off-screen objects still update',
    fix: 'Use VisibleOnScreenNotifier2D/3D to disable processing when off-screen',
  },
  {
    id: 'large_array_in_process',
    pattern: /func _process\([^)]*\)[^}]*(?:Array|Dictionary)\s*=/s,
    severity: 'warning' as const,
    description: 'Allocating Array/Dictionary inside _process() — triggers GC pressure',
    fix: 'Pre-allocate collections as class members and reuse them',
  },
  {
    id: 'await_without_validity_check',
    pattern: /await[^)]*\n(?!.*is_instance_valid)/s,
    severity: 'warning' as const,
    description: 'await without checking if node is still valid afterwards',
    fix: 'After await, check: if not is_instance_valid(self): return',
  },
  {
    id: 'duplicate_signal_connection',
    pattern: /\.connect\([^)]*\)[\s\S]*\.connect\([^)]*\)/,
    severity: 'suggestion' as const,
    description: 'Multiple signal connections without checking is_connected()',
    fix: 'Guard with: if not signal.is_connected(callable): signal.connect(callable)',
  },
  {
    id: 'deep_node_hierarchy',
    pattern: /\$"[^"]*\/[^"]*\/[^"]*\/[^"]*\/[^"]*"/,
    severity: 'warning' as const,
    description: 'Deep node path (5+ levels) — indicates overly nested scene tree',
    fix: 'Flatten hierarchy using scene composition; use Groups or @export NodePath',
  },
] as const;

export class PerformanceAnalyzer {
  /**
   * Analyze a single GDScript file for performance anti-patterns.
   */
  analyzeScript(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    for (const ap of ANTI_PATTERNS) {
      const match = ap.pattern.exec(content);
      if (match) {
        const line = content.substring(0, match.index).split('\n').length;
        issues.push({
          pattern: ap.id,
          severity: ap.severity,
          file: filePath,
          line,
          description: ap.description,
          fix: ap.fix,
        });
      }
    }

    return issues;
  }

  /**
   * Generate a full performance report from multiple file analyses.
   */
  generateReport(allIssues: PerformanceIssue[]): PerformanceReport {
    const errors = allIssues.filter((i) => i.severity === 'error').length;
    const warnings = allIssues.filter((i) => i.severity === 'warning').length;
    const suggestions = allIssues.filter((i) => i.severity === 'suggestion').length;

    // Score: start at 100, deduct per issue
    const deductions = errors * 15 + warnings * 5 + suggestions * 2;
    const score = Math.max(0, 100 - deductions);

    return {
      totalIssues: allIssues.length,
      errors,
      warnings,
      suggestions,
      issues: allIssues,
      score,
    };
  }
}
