/**
 * ReportGenerator — Generates formatted analysis reports
 *
 * Produces Markdown and JSON reports from analyzer outputs.
 */

export interface ReportSection {
  title: string;
  content: string;
  severity?: 'error' | 'warning' | 'info';
}

export class ReportGenerator {
  /**
   * Generate a Markdown performance report.
   */
  generatePerformanceReport(data: {
    score: number;
    issues: Array<{ pattern: string; severity: string; file: string; line: number; description: string; fix: string }>;
  }): string {
    const lines: string[] = [];

    lines.push('# Performance Analysis Report');
    lines.push('');
    lines.push(`## Score: ${data.score}/100 ${this._scoreEmoji(data.score)}`);
    lines.push('');

    if (data.issues.length === 0) {
      lines.push('No performance issues detected. 🎉');
      return lines.join('\n');
    }

    lines.push(`| Severity | Pattern | File | Line | Description |`);
    lines.push(`|----------|---------|------|------|-------------|`);

    for (const issue of data.issues) {
      const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
      lines.push(`| ${icon} ${issue.severity} | ${issue.pattern} | ${issue.file} | ${issue.line} | ${issue.description} |`);
    }

    lines.push('');
    lines.push('## Recommendations');
    lines.push('');

    const fixes = [...new Set(data.issues.map((i) => i.fix))];
    for (const fix of fixes) {
      lines.push(`- ${fix}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate a Markdown quality report.
   */
  generateQualityReport(data: {
    score: number;
    totalIssues: number;
    metrics: { filesAnalyzed: number; signalCount: number; classCount: number; averageLinesPerFile: number };
    issues: Array<{ rule: string; severity: string; file: string; line: number; message: string }>;
  }): string {
    const lines: string[] = [];

    lines.push('# Code Quality Report');
    lines.push('');
    lines.push(`## Score: ${data.score}/100 ${this._scoreEmoji(data.score)}`);
    lines.push('');
    lines.push('## Metrics');
    lines.push('');
    lines.push(`- Files analyzed: ${data.metrics.filesAnalyzed}`);
    lines.push(`- Total signals: ${data.metrics.signalCount}`);
    lines.push(`- Total classes: ${data.metrics.classCount}`);
    lines.push(`- Avg lines/file: ${data.metrics.averageLinesPerFile}`);
    lines.push('');

    if (data.issues.length > 0) {
      lines.push('## Issues');
      lines.push('');
      lines.push(`| Severity | Rule | File:Line | Message |`);
      lines.push(`|----------|------|-----------|---------|`);

      for (const issue of data.issues.slice(0, 50)) {
        const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
        lines.push(`| ${icon} | ${issue.rule} | ${issue.file}:${issue.line} | ${issue.message} |`);
      }

      if (data.issues.length > 50) {
        lines.push(`\n*...and ${data.issues.length - 50} more issues*`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate a JSON report for programmatic consumption.
   */
  generateJson(data: Record<string, unknown>): string {
    return JSON.stringify(data, null, 2);
  }

  private _scoreEmoji(score: number): string {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    if (score >= 50) return '🟠';
    return '🔴';
  }
}
