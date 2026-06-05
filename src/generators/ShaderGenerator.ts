/**
 * ShaderGenerator — Generates Godot shader code from templates
 *
 * Reference: https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/shading_language.html
 */

export type ShaderType = 'spatial' | 'canvas_item' | 'particles' | 'sky' | 'fog';

export interface ShaderUniform {
  name: string;
  type: string;
  hint?: string;
  default?: string;
}

export interface ShaderConfig {
  name: string;
  type: ShaderType;
  renderMode?: string[];
  uniforms: ShaderUniform[];
  vertexCode?: string;
  fragmentCode: string;
  lightCode?: string;
}

export class ShaderGenerator {
  /**
   * Generate shader code from configuration.
   */
  generate(config: ShaderConfig): string {
    const lines: string[] = [];

    // Shader type declaration
    let declaration = `shader_type ${config.type};`;
    if (config.renderMode && config.renderMode.length > 0) {
      declaration = `shader_type ${config.type};\nrender_mode ${config.renderMode.join(', ')};`;
    }
    lines.push(declaration);
    lines.push('');

    // Uniforms
    if (config.uniforms.length > 0) {
      for (const u of config.uniforms) {
        let line = `uniform ${u.type} ${u.name}`;
        if (u.hint) {
          line += ` : ${u.hint}`;
        }
        if (u.default) {
          line += ` = ${u.default}`;
        }
        line += ';';
        lines.push(line);
      }
      lines.push('');
    }

    // Vertex function
    if (config.vertexCode) {
      lines.push('void vertex() {');
      for (const codeLine of config.vertexCode.split('\n')) {
        lines.push(`\t${codeLine}`);
      }
      lines.push('}');
      lines.push('');
    }

    // Fragment function
    lines.push('void fragment() {');
    for (const codeLine of config.fragmentCode.split('\n')) {
      lines.push(`\t${codeLine}`);
    }
    lines.push('}');

    // Light function
    if (config.lightCode) {
      lines.push('');
      lines.push('void light() {');
      for (const codeLine of config.lightCode.split('\n')) {
        lines.push(`\t${codeLine}`);
      }
      lines.push('}');
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Validate shader configuration for platform compatibility.
   */
  validateForPlatform(
    config: ShaderConfig,
    platform: 'desktop' | 'mobile' | 'web'
  ): string[] {
    const warnings: string[] = [];

    if (platform === 'web' && config.type === 'sky') {
      warnings.push('Sky shaders may have limited support on WebGL 2.0');
    }

    if (platform === 'mobile') {
      // Check for expensive operations
      if (config.fragmentCode.includes('texture(') && 
          (config.fragmentCode.match(/texture\(/g) || []).length > 4) {
        warnings.push('More than 4 texture samples in fragment — may be expensive on mobile GPUs');
      }
    }

    if (platform === 'web' || platform === 'mobile') {
      if (config.renderMode?.includes('depth_prepass_alpha')) {
        warnings.push('depth_prepass_alpha may not work correctly on all mobile/web GPUs');
      }
    }

    return warnings;
  }
}
