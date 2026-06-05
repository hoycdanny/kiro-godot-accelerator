/**
 * ScriptGenerator — Generates type-safe GDScript from templates
 *
 * Produces GDScript with proper type annotations, signal declarations,
 * export variables, and follows official style guide.
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html
 */

export interface ScriptConfig {
  className?: string;
  extends: string;
  signals?: Array<{ name: string; params?: Array<{ name: string; type: string }> }>;
  exports?: Array<{ name: string; type: string; default?: string; group?: string; hint?: string }>;
  variables?: Array<{ name: string; type: string; default?: string; private?: boolean }>;
  onready?: Array<{ name: string; type: string; path: string }>;
  methods?: Array<{
    name: string;
    params?: Array<{ name: string; type: string }>;
    returnType?: string;
    body: string;
    private?: boolean;
  }>;
}

export class ScriptGenerator {
  /**
   * Generate a complete GDScript file from configuration.
   */
  generate(config: ScriptConfig): string {
    const sections: string[] = [];

    // class_name and extends
    if (config.className) {
      sections.push(`class_name ${config.className}`);
    }
    sections.push(`extends ${config.extends}`);
    sections.push('');

    // Signals
    if (config.signals && config.signals.length > 0) {
      for (const sig of config.signals) {
        if (sig.params && sig.params.length > 0) {
          const params = sig.params.map((p) => `${p.name}: ${p.type}`).join(', ');
          sections.push(`signal ${sig.name}(${params})`);
        } else {
          sections.push(`signal ${sig.name}`);
        }
      }
      sections.push('');
    }

    // Export variables (grouped)
    if (config.exports && config.exports.length > 0) {
      let currentGroup = '';
      for (const exp of config.exports) {
        if (exp.group && exp.group !== currentGroup) {
          currentGroup = exp.group;
          sections.push(`@export_group("${currentGroup}")`);
        }
        const hint = exp.hint ? `@export_${exp.hint} ` : '@export ';
        const defaultVal = exp.default ? ` = ${exp.default}` : '';
        sections.push(`${hint}var ${exp.name}: ${exp.type}${defaultVal}`);
      }
      sections.push('');
    }

    // Regular variables
    if (config.variables && config.variables.length > 0) {
      for (const v of config.variables) {
        const prefix = v.private ? '_' : '';
        const defaultVal = v.default ? ` = ${v.default}` : '';
        sections.push(`var ${prefix}${v.name}: ${v.type}${defaultVal}`);
      }
      sections.push('');
    }

    // @onready variables
    if (config.onready && config.onready.length > 0) {
      for (const o of config.onready) {
        sections.push(`@onready var ${o.name}: ${o.type} = $${o.path}`);
      }
      sections.push('');
    }

    // Methods
    if (config.methods && config.methods.length > 0) {
      for (const method of config.methods) {
        const prefix = method.private ? '_' : '';
        const params = method.params
          ? method.params.map((p) => `${p.name}: ${p.type}`).join(', ')
          : '';
        const returnType = method.returnType ? ` -> ${method.returnType}` : ' -> void';
        sections.push('');
        sections.push(`func ${prefix}${method.name}(${params})${returnType}:`);

        const bodyLines = method.body.split('\n');
        for (const line of bodyLines) {
          sections.push(`\t${line}`);
        }
      }
    }

    return sections.join('\n') + '\n';
  }

  /**
   * Generate a minimal script with just extends and _ready.
   */
  generateMinimal(extendsType: string, className?: string): string {
    return this.generate({
      className,
      extends: extendsType,
      methods: [
        {
          name: '_ready',
          returnType: 'void',
          body: 'pass',
        },
      ],
    });
  }

  /**
   * Validate script configuration.
   */
  validate(config: ScriptConfig): string[] {
    const errors: string[] = [];

    if (!config.extends) {
      errors.push('Missing extends declaration');
    }

    if (config.className && !/^[A-Z][a-zA-Z0-9]*$/.test(config.className)) {
      errors.push(`class_name '${config.className}' must be PascalCase`);
    }

    if (config.signals) {
      for (const sig of config.signals) {
        if (!/^[a-z][a-z0-9_]*$/.test(sig.name)) {
          errors.push(`Signal '${sig.name}' must be snake_case`);
        }
      }
    }

    return errors;
  }
}
