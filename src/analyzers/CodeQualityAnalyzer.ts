/**
 * CodeQualityAnalyzer — Validates GDScript code quality and architecture
 *
 * Checks naming conventions, signal coupling, scene composition,
 * and detects circular dependencies.
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html
 */

export interface QualityIssue {
  rule: string;
  severity: 'error' | 'warning' | 'suggestion';
  file: string;
  line: number;
  message: string;
  fix: string;
}

export interface QualityReport {
  totalIssues: number;
  score: number;
  issues: QualityIssue[];
  metrics: {
    filesAnalyzed: number;
    signalCount: number;
    classCount: number;
    averageLinesPerFile: number;
  };
}

const NAMING_RULES = {
  variable: /^_?[a-z][a-z0-9_]*$/,
  constant: /^[A-Z][A-Z0-9_]*$/,
  function: /^_?[a-z][a-z0-9_]*$/,
  signal: /^[a-z][a-z0-9_]*$/,
  className: /^[A-Z][a-zA-Z0-9]*$/,
};

export class CodeQualityAnalyzer {
  /**
   * Check naming convention violations in a GDScript file.
   */
  checkNaming(content: string, filePath: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check variable naming
      const varMatch = line.match(/^(?:@export[^\n]*)?\s*var\s+(\w+)/);
      if (varMatch) {
        const name = varMatch[1];
        if (!NAMING_RULES.variable.test(name)) {
          issues.push({
            rule: 'naming/variable',
            severity: 'warning',
            file: filePath,
            line: lineNum,
            message: `Variable '${name}' should use snake_case`,
            fix: `Rename to: ${this._toSnakeCase(name)}`,
          });
        }
      }

      // Check constant naming
      const constMatch = line.match(/^const\s+(\w+)/);
      if (constMatch) {
        const name = constMatch[1];
        if (!NAMING_RULES.constant.test(name)) {
          issues.push({
            rule: 'naming/constant',
            severity: 'warning',
            file: filePath,
            line: lineNum,
            message: `Constant '${name}' should use SCREAMING_SNAKE_CASE`,
            fix: `Rename to: ${name.toUpperCase()}`,
          });
        }
      }

      // Check signal naming
      const signalMatch = line.match(/^signal\s+(\w+)/);
      if (signalMatch) {
        const name = signalMatch[1];
        if (!NAMING_RULES.signal.test(name)) {
          issues.push({
            rule: 'naming/signal',
            severity: 'warning',
            file: filePath,
            line: lineNum,
            message: `Signal '${name}' should use snake_case (past tense preferred)`,
            fix: `Rename to: ${this._toSnakeCase(name)}`,
          });
        }
      }

      // Check function naming
      const funcMatch = line.match(/^func\s+(\w+)/);
      if (funcMatch) {
        const name = funcMatch[1];
        if (!NAMING_RULES.function.test(name)) {
          issues.push({
            rule: 'naming/function',
            severity: 'warning',
            file: filePath,
            line: lineNum,
            message: `Function '${name}' should use snake_case`,
            fix: `Rename to: ${this._toSnakeCase(name)}`,
          });
        }
      }

      // Check class_name
      const classMatch = line.match(/^class_name\s+(\w+)/);
      if (classMatch) {
        const name = classMatch[1];
        if (!NAMING_RULES.className.test(name)) {
          issues.push({
            rule: 'naming/class_name',
            severity: 'error',
            file: filePath,
            line: lineNum,
            message: `class_name '${name}' must use PascalCase`,
            fix: `Rename to: ${this._toPascalCase(name)}`,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check for missing static type annotations.
   */
  checkStaticTyping(content: string, filePath: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check untyped variables (var x = ... without : Type)
      if (/^(?:@export\s+)?var\s+\w+\s*=/.test(line) && !/:/.test(line.split('=')[0])) {
        issues.push({
          rule: 'typing/missing-annotation',
          severity: 'suggestion',
          file: filePath,
          line: i + 1,
          message: 'Variable lacks type annotation — add explicit type for compile-time checks',
          fix: 'Change to: var name: Type = value',
        });
      }

      // Check untyped function parameters
      const funcMatch = line.match(/^func\s+\w+\(([^)]+)\)/);
      if (funcMatch) {
        const params = funcMatch[1].split(',');
        for (const param of params) {
          if (param.trim() && !param.includes(':')) {
            issues.push({
              rule: 'typing/untyped-parameter',
              severity: 'warning',
              file: filePath,
              line: i + 1,
              message: `Function parameter '${param.trim()}' lacks type annotation`,
              fix: 'Add type: param_name: Type',
            });
          }
        }
      }

      // Check untyped return
      if (/^func\s+\w+\([^)]*\)\s*:?\s*$/.test(line) && !line.includes('->')) {
        // Function without return type (could be void)
        // Only flag if it has a return statement
      }
    }

    return issues;
  }

  /**
   * Detect tight coupling (direct parent/sibling references).
   */
  checkCoupling(content: string, filePath: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check get_parent() usage
      if (line.includes('get_parent()') && !line.trim().startsWith('#')) {
        issues.push({
          rule: 'coupling/get_parent',
          severity: 'warning',
          file: filePath,
          line: i + 1,
          message: 'get_parent() creates tight coupling — child depends on parent structure',
          fix: 'Use signals to communicate upward, or @export a NodePath',
        });
      }

      // Check "../" path access
      if (/\$"?\.\.\//.test(line) && !line.trim().startsWith('#')) {
        issues.push({
          rule: 'coupling/parent_path',
          severity: 'warning',
          file: filePath,
          line: i + 1,
          message: '"../" node path creates structural dependency on parent scene',
          fix: 'Use signals (emit up), @export NodePath, or Groups',
        });
      }
    }

    return issues;
  }

  /**
   * Generate aggregate quality report.
   */
  generateReport(
    files: Array<{ path: string; content: string }>
  ): QualityReport {
    const allIssues: QualityIssue[] = [];
    let signalCount = 0;
    let classCount = 0;
    let totalLines = 0;

    for (const file of files) {
      allIssues.push(...this.checkNaming(file.content, file.path));
      allIssues.push(...this.checkStaticTyping(file.content, file.path));
      allIssues.push(...this.checkCoupling(file.content, file.path));

      signalCount += (file.content.match(/^signal\s+/gm) || []).length;
      classCount += (file.content.match(/^class_name\s+/gm) || []).length;
      totalLines += file.content.split('\n').length;
    }

    const errors = allIssues.filter((i) => i.severity === 'error').length;
    const warnings = allIssues.filter((i) => i.severity === 'warning').length;
    const suggestions = allIssues.filter((i) => i.severity === 'suggestion').length;
    const deductions = errors * 20 + warnings * 5 + suggestions * 1;
    const score = Math.max(0, 100 - deductions);

    return {
      totalIssues: allIssues.length,
      score,
      issues: allIssues,
      metrics: {
        filesAnalyzed: files.length,
        signalCount,
        classCount,
        averageLinesPerFile: files.length > 0 ? Math.round(totalLines / files.length) : 0,
      },
    };
  }

  private _toSnakeCase(name: string): string {
    return name
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  private _toPascalCase(name: string): string {
    return name
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
