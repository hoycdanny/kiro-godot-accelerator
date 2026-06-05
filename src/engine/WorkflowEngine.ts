/**
 * WorkflowEngine — Executes multi-step workflows with dependency ordering
 *
 * Manages sequential/parallel step execution, error recovery,
 * and conditional branching for complex operations.
 */

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  dependsOn?: string[];
  action: string;
  params: Record<string, unknown>;
  onFailure: 'stop' | 'skip' | 'retry';
  maxRetries?: number;
}

export interface WorkflowDefinition {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface StepResult {
  stepId: string;
  status: StepStatus;
  output?: unknown;
  error?: string;
  durationMs: number;
  retries: number;
}

export interface WorkflowResult {
  name: string;
  status: 'completed' | 'failed' | 'partial';
  steps: StepResult[];
  totalDurationMs: number;
}

export class WorkflowEngine {
  /**
   * Validate workflow definition (check for missing dependencies, cycles).
   */
  validate(workflow: WorkflowDefinition): string[] {
    const errors: string[] = [];
    const stepIds = new Set(workflow.steps.map((s) => s.id));

    for (const step of workflow.steps) {
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          if (!stepIds.has(dep)) {
            errors.push(`Step '${step.id}' depends on unknown step '${dep}'`);
          }
        }
      }
    }

    // Check for cycles
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (visiting.has(stepId)) return true;
      if (visited.has(stepId)) return false;

      visiting.add(stepId);
      const step = workflow.steps.find((s) => s.id === stepId);
      if (step?.dependsOn) {
        for (const dep of step.dependsOn) {
          if (hasCycle(dep)) return true;
        }
      }
      visiting.delete(stepId);
      visited.add(stepId);
      return false;
    };

    for (const step of workflow.steps) {
      if (hasCycle(step.id)) {
        errors.push(`Circular dependency detected involving step '${step.id}'`);
        break;
      }
    }

    return errors;
  }

  /**
   * Get execution order using topological sort.
   */
  getExecutionOrder(workflow: WorkflowDefinition): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (stepId: string): void => {
      if (visited.has(stepId)) return;
      visited.add(stepId);

      const step = workflow.steps.find((s) => s.id === stepId);
      if (step?.dependsOn) {
        for (const dep of step.dependsOn) {
          visit(dep);
        }
      }
      order.push(stepId);
    };

    for (const step of workflow.steps) {
      visit(step.id);
    }

    return order;
  }

  /**
   * Execute a workflow step (mock implementation — real execution delegates to MCP tools).
   */
  async executeStep(
    step: WorkflowStep,
    executor: (action: string, params: Record<string, unknown>) => Promise<unknown>
  ): Promise<StepResult> {
    const startTime = Date.now();
    let retries = 0;
    const maxRetries = step.maxRetries ?? (step.onFailure === 'retry' ? 2 : 0);

    while (retries <= maxRetries) {
      try {
        const output = await executor(step.action, step.params);
        return {
          stepId: step.id,
          status: 'completed',
          output,
          durationMs: Date.now() - startTime,
          retries,
        };
      } catch (err) {
        retries++;
        if (retries > maxRetries) {
          return {
            stepId: step.id,
            status: 'failed',
            error: err instanceof Error ? err.message : String(err),
            durationMs: Date.now() - startTime,
            retries: retries - 1,
          };
        }
      }
    }

    // Unreachable, but TypeScript needs it
    return {
      stepId: step.id,
      status: 'failed',
      error: 'Unexpected execution path',
      durationMs: Date.now() - startTime,
      retries,
    };
  }
}
