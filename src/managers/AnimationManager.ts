/**
 * AnimationManager — Manages AnimationPlayer/AnimationTree configuration
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html
 */

export interface AnimationState {
  name: string;
  animation: string;
  speed: number;
  autoAdvance?: boolean;
}

export interface StateTransition {
  from: string;
  to: string;
  condition?: string;
  autoAdvance?: boolean;
  switchMode?: 'immediate' | 'at_end' | 'sync';
}

export interface StateMachineConfig {
  name: string;
  states: AnimationState[];
  transitions: StateTransition[];
  defaultState: string;
}

export interface BlendTreeConfig {
  name: string;
  type: '1d' | '2d';
  parameter: string;
  points: Array<{
    position: number | { x: number; y: number };
    animation: string;
  }>;
}

export class AnimationManager {
  /**
   * Generate AnimationTree state machine configuration description.
   * (Returns a structured config that describes the setup needed)
   */
  generateStateMachineSetup(config: StateMachineConfig): string {
    const lines: string[] = [];

    lines.push(`# AnimationTree State Machine Setup: ${config.name}`);
    lines.push(`# Default State: ${config.defaultState}`);
    lines.push('#');
    lines.push('# States:');

    for (const state of config.states) {
      lines.push(`#   - ${state.name} → plays "${state.animation}" (speed: ${state.speed}x)`);
    }

    lines.push('#');
    lines.push('# Transitions:');

    for (const t of config.transitions) {
      const cond = t.condition ? ` [condition: ${t.condition}]` : ' [auto]';
      const mode = t.switchMode ? ` (${t.switchMode})` : '';
      lines.push(`#   ${t.from} → ${t.to}${cond}${mode}`);
    }

    lines.push('');
    lines.push('# GDScript setup:');
    lines.push('@onready var anim_tree: AnimationTree = $AnimationTree');
    lines.push('@onready var state_machine: AnimationNodeStateMachinePlayback = \\');
    lines.push('\tanim_tree["parameters/playback"]');
    lines.push('');
    lines.push('func _transition_to_state(state_name: String) -> void:');
    lines.push('\tstate_machine.travel(state_name)');

    return lines.join('\n');
  }

  /**
   * Generate GDScript code for blend tree parameter control.
   */
  generateBlendTreeController(config: BlendTreeConfig): string {
    const lines: string[] = [];

    lines.push(`# BlendTree Controller: ${config.name}`);
    lines.push(`# Type: ${config.type === '1d' ? 'BlendSpace1D' : 'BlendSpace2D'}`);
    lines.push(`# Parameter: ${config.parameter}`);
    lines.push('');

    if (config.type === '1d') {
      lines.push(`func _update_blend(value: float) -> void:`);
      lines.push(`\tanim_tree["parameters/${config.name}/blend_position"] = value`);
    } else {
      lines.push(`func _update_blend(value: Vector2) -> void:`);
      lines.push(`\tanim_tree["parameters/${config.name}/blend_position"] = value`);
    }

    lines.push('');
    lines.push('# Blend points:');
    for (const point of config.points) {
      const pos = typeof point.position === 'number'
        ? String(point.position)
        : `(${point.position.x}, ${point.position.y})`;
      lines.push(`#   ${pos} → "${point.animation}"`);
    }

    return lines.join('\n');
  }

  /**
   * Validate state machine configuration.
   */
  validateStateMachine(config: StateMachineConfig): string[] {
    const errors: string[] = [];
    const stateNames = new Set(config.states.map((s) => s.name));

    if (!stateNames.has(config.defaultState)) {
      errors.push(`Default state '${config.defaultState}' not found in states list`);
    }

    for (const t of config.transitions) {
      if (!stateNames.has(t.from)) {
        errors.push(`Transition source '${t.from}' not found in states`);
      }
      if (!stateNames.has(t.to)) {
        errors.push(`Transition target '${t.to}' not found in states`);
      }
    }

    // Check for unreachable states
    const reachable = new Set<string>([config.defaultState]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of config.transitions) {
        if (reachable.has(t.from) && !reachable.has(t.to)) {
          reachable.add(t.to);
          changed = true;
        }
      }
    }

    for (const state of config.states) {
      if (!reachable.has(state.name)) {
        errors.push(`State '${state.name}' is unreachable from default state`);
      }
    }

    return errors;
  }
}
