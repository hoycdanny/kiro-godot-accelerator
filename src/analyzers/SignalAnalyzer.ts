/**
 * SignalAnalyzer — Analyzes signal usage patterns and coupling in GDScript projects
 *
 * Scans signal declarations, emissions, connections, and generates coupling graphs.
 *
 * Reference: https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html
 */

export interface SignalDeclaration {
  name: string;
  parameters: string[];
  file: string;
  line: number;
}

export interface SignalConnection {
  signalName: string;
  sourceFile: string;
  targetCallable: string;
  line: number;
}

export interface SignalEmission {
  signalName: string;
  file: string;
  line: number;
}

export interface CouplingReport {
  declarations: SignalDeclaration[];
  emissions: SignalEmission[];
  connections: SignalConnection[];
  unusedSignals: SignalDeclaration[];
  couplingScore: number; // 0-100, lower is better (less coupling)
  recommendations: string[];
}

export class SignalAnalyzer {
  /**
   * Extract all signal declarations from a GDScript file.
   */
  extractDeclarations(content: string, filePath: string): SignalDeclaration[] {
    const declarations: SignalDeclaration[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^signal\s+(\w+)(?:\(([^)]*)\))?/);
      if (match) {
        const params = match[2]
          ? match[2].split(',').map((p) => p.trim())
          : [];
        declarations.push({
          name: match[1],
          parameters: params,
          file: filePath,
          line: i + 1,
        });
      }
    }

    return declarations;
  }

  /**
   * Extract all signal emissions from a GDScript file.
   */
  extractEmissions(content: string, filePath: string): SignalEmission[] {
    const emissions: SignalEmission[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(\w+)\.emit\(/);
      if (match && !lines[i].trim().startsWith('#')) {
        emissions.push({
          signalName: match[1],
          file: filePath,
          line: i + 1,
        });
      }
    }

    return emissions;
  }

  /**
   * Extract all signal connections from a GDScript file.
   */
  extractConnections(content: string, filePath: string): SignalConnection[] {
    const connections: SignalConnection[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(\w+)\.connect\(([^)]+)\)/);
      if (match && !lines[i].trim().startsWith('#')) {
        connections.push({
          signalName: match[1],
          sourceFile: filePath,
          targetCallable: match[2].trim(),
          line: i + 1,
        });
      }
    }

    return connections;
  }

  /**
   * Generate coupling analysis report across multiple files.
   */
  analyzeProject(
    files: Array<{ path: string; content: string }>
  ): CouplingReport {
    const allDeclarations: SignalDeclaration[] = [];
    const allEmissions: SignalEmission[] = [];
    const allConnections: SignalConnection[] = [];

    for (const file of files) {
      allDeclarations.push(...this.extractDeclarations(file.content, file.path));
      allEmissions.push(...this.extractEmissions(file.content, file.path));
      allConnections.push(...this.extractConnections(file.content, file.path));
    }

    // Find unused signals (declared but never emitted)
    const emittedNames = new Set(allEmissions.map((e) => e.signalName));
    const unusedSignals = allDeclarations.filter(
      (d) => !emittedNames.has(d.name)
    );

    // Calculate coupling score
    const recommendations: string[] = [];
    let couplingScore = 0;

    // High connection count per file indicates coupling
    const connectionsPerFile = new Map<string, number>();
    for (const conn of allConnections) {
      const count = connectionsPerFile.get(conn.sourceFile) || 0;
      connectionsPerFile.set(conn.sourceFile, count + 1);
    }

    for (const [file, count] of connectionsPerFile) {
      if (count > 10) {
        couplingScore += 10;
        recommendations.push(
          `${file} has ${count} signal connections — consider using an Event Bus for distant nodes`
        );
      }
    }

    if (unusedSignals.length > 0) {
      recommendations.push(
        `${unusedSignals.length} signal(s) declared but never emitted — remove or implement`
      );
    }

    // Cap score
    couplingScore = Math.min(100, couplingScore);

    return {
      declarations: allDeclarations,
      emissions: allEmissions,
      connections: allConnections,
      unusedSignals,
      couplingScore,
      recommendations,
    };
  }
}
