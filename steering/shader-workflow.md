# Shader Workflow — Steering File

## English Summary
Covers Godot 4.x shader development: VisualShader vs text shaders, shader types,
uniform parameters, platform considerations, and common shader patterns.

## Official References
- Shading Language: https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/shading_language.html
- Shader Types: https://docs.godotengine.org/en/stable/tutorials/shaders/index.html
- VisualShaders: https://docs.godotengine.org/en/stable/tutorials/shaders/visual_shaders.html
- Screen-reading Shaders: https://docs.godotengine.org/en/stable/tutorials/shaders/screen-reading_shaders.html
- Custom Post-Processing: https://docs.godotengine.org/en/stable/tutorials/shaders/custom_postprocessing.html

---

## Shader 類型

| 類型 | 用途 | 關鍵字 |
|---|---|---|
| `shader_type spatial` | 3D 物件 | vertex, fragment, light |
| `shader_type canvas_item` | 2D 物件 / UI | vertex, fragment, light |
| `shader_type particles` | GPU 粒子 | start, process |
| `shader_type sky` | 天空盒 | sky |
| `shader_type fog` | 體積霧 | fog |

## VisualShader vs 文字 Shader

### VisualShader 適用情境
- 快速原型
- 美術師使用
- 標準 PBR 材質調整
- 簡單特效

### 文字 Shader 適用情境
- 複雜數學運算
- 自定義光照模型
- 需要精確控制
- 效能敏感路徑
- 版本控制友好

## 常用 Shader 範本

### Sprite 外框（Outline）
```glsl
shader_type canvas_item;

uniform vec4 outline_color : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float outline_width : hint_range(0.0, 10.0, 0.5) = 1.0;

void fragment() {
    vec2 size = TEXTURE_PIXEL_SIZE * outline_width;
    float alpha = texture(TEXTURE, UV).a;

    alpha = max(alpha, texture(TEXTURE, UV + vec2(size.x, 0.0)).a);
    alpha = max(alpha, texture(TEXTURE, UV + vec2(-size.x, 0.0)).a);
    alpha = max(alpha, texture(TEXTURE, UV + vec2(0.0, size.y)).a);
    alpha = max(alpha, texture(TEXTURE, UV + vec2(0.0, -size.y)).a);

    vec4 color = texture(TEXTURE, UV);
    COLOR = mix(outline_color * vec4(1.0, 1.0, 1.0, alpha), color, color.a);
}
```

### 溶解效果（Dissolve）
```glsl
shader_type canvas_item;

uniform sampler2D noise_texture : filter_linear;
uniform float dissolve_amount : hint_range(0.0, 1.0) = 0.0;
uniform float edge_width : hint_range(0.0, 0.2) = 0.05;
uniform vec4 edge_color : source_color = vec4(1.0, 0.5, 0.0, 1.0);

void fragment() {
    vec4 tex_color = texture(TEXTURE, UV);
    float noise = texture(noise_texture, UV).r;

    float edge = smoothstep(dissolve_amount, dissolve_amount + edge_width, noise);
    float alpha_clip = step(dissolve_amount, noise);

    COLOR = mix(edge_color, tex_color, edge);
    COLOR.a *= alpha_clip * tex_color.a;
}
```

### 卡通光照（Toon / Cel Shading）
```glsl
shader_type spatial;
render_mode diffuse_toon, specular_toon;

uniform vec4 albedo_color : source_color = vec4(1.0);
uniform sampler2D albedo_texture : source_color;
uniform float toon_steps : hint_range(1.0, 8.0, 1.0) = 3.0;

void fragment() {
    ALBEDO = texture(albedo_texture, UV).rgb * albedo_color.rgb;
}

void light() {
    float ndotl = dot(NORMAL, LIGHT);
    float stepped = ceil(ndotl * toon_steps) / toon_steps;
    DIFFUSE_LIGHT += stepped * ATTENUATION * LIGHT_COLOR;
}
```

## Uniform 參數設計

### Hint 類型
```glsl
uniform float speed : hint_range(0.0, 100.0, 0.1) = 10.0;
uniform vec4 color : source_color = vec4(1.0);
uniform sampler2D texture_map : hint_default_white;
uniform sampler2D normal_map : hint_normal;
uniform sampler2D roughness_map : hint_roughness_gray;
```

### 在 GDScript 中設定
```gdscript
# 透過 ShaderMaterial
var material := ShaderMaterial.new()
material.shader = preload("res://shaders/dissolve.gdshader")
material.set_shader_parameter("dissolve_amount", 0.5)
material.set_shader_parameter("edge_color", Color.ORANGE_RED)
```

## 平台注意事項

### Compatibility 渲染器限制
- 無 `screen_texture`（需要替代方案）
- Shader model 限制（GLSL ES 3.0）
- 部分內建函數不可用

### Mobile 效能考量
- 避免 dependent texture reads
- 限制 texture samples 數量（建議 ≤ 4）
- 避免複雜分支（if/else）
- 使用 `lowp`/`mediump` 精度提示

### Web 限制
- WebGL 2.0 = OpenGL ES 3.0 子集
- 無 compute shaders
- 部分擴展不可用
