/**
 * SceneManager — Manages scene creation from templates
 *
 * Generates .tscn content from scaffold templates and handles
 * scene hierarchy construction.
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html
 */

export interface SceneNode {
  type: string;
  name: string;
  properties?: Record<string, unknown>;
  children?: SceneNode[];
}

export interface SceneTemplate {
  name: string;
  description: string;
  rootNodeType: string;
  rootNodeName: string;
  nodes: SceneNode[];
}

export class SceneManager {
  /**
   * Generate .tscn file content from a template definition.
   *
   * Godot .tscn format reference:
   * https://docs.godotengine.org/en/stable/contributing/development/file_formats/tscn.html
   */
  generateTscn(template: SceneTemplate): string {
    const lines: string[] = [];
    let nodeCount = 0;

    // Header
    lines.push(`[gd_scene format=3]`);
    lines.push('');

    // Root node
    lines.push(`[node name="${template.rootNodeName}" type="${template.rootNodeType}"]`);
    nodeCount++;

    // Recursive node generation
    const generateNodes = (nodes: SceneNode[], parentPath: string): void => {
      for (const node of nodes) {
        lines.push('');
        lines.push(
          `[node name="${node.name}" type="${node.type}" parent="${parentPath}"]`
        );

        if (node.properties) {
          for (const [key, value] of Object.entries(node.properties)) {
            lines.push(`${key} = ${this._formatValue(value)}`);
          }
        }

        nodeCount++;

        if (node.children && node.children.length > 0) {
          const childPath = parentPath === '.'
            ? node.name
            : `${parentPath}/${node.name}`;
          generateNodes(node.children, childPath);
        }
      }
    };

    generateNodes(template.nodes, '.');

    return lines.join('\n') + '\n';
  }

  /**
   * Validate a scene template for correctness.
   */
  validateTemplate(template: SceneTemplate): string[] {
    const errors: string[] = [];

    if (!template.rootNodeType) {
      errors.push('Missing rootNodeType');
    }
    if (!template.rootNodeName) {
      errors.push('Missing rootNodeName');
    }

    const names = new Set<string>();
    const checkNames = (nodes: SceneNode[], path: string): void => {
      for (const node of nodes) {
        const fullPath = `${path}/${node.name}`;
        if (names.has(fullPath)) {
          errors.push(`Duplicate node path: ${fullPath}`);
        }
        names.add(fullPath);

        if (!node.type) {
          errors.push(`Node at ${fullPath} missing type`);
        }
        if (!node.name) {
          errors.push(`Node at ${path} missing name`);
        }

        if (node.children) {
          checkNames(node.children, fullPath);
        }
      }
    };

    checkNames(template.nodes, template.rootNodeName);
    return errors;
  }

  /**
   * Format a value for .tscn syntax.
   */
  private _formatValue(value: unknown): string {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? String(value) : value.toFixed(6);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, number>;
      if ('x' in obj && 'y' in obj && 'z' in obj) {
        return `Vector3(${obj.x}, ${obj.y}, ${obj.z})`;
      }
      if ('x' in obj && 'y' in obj) {
        return `Vector2(${obj.x}, ${obj.y})`;
      }
    }
    return String(value);
  }
}
