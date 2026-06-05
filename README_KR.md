# Kiro Godot Accelerator

[English](README.md) | [繁體中文](README_TW.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> **언어 참고:** Steering 파일(도메인 지식)은 번체 중국어로 작성되어 있으며, 각 파일 상단에 영문 요약 섹션이 있습니다. Power는 개발자가 선호하는 언어로 응답합니다. 언어 장벽이 있으시면 Issue를 생성하여 커뮤니티 지원을 받으세요.

IDE를 Godot Engine 개발 AI 어시스턴트로 변환합니다. MCP(Model Context Protocol)를 통해 자연어로 Godot Editor를 제어할 수 있습니다. 씬 관리, GDScript 생성, 에셋 파이프라인, 빌드 자동화, 성능 분석, 코드 품질 검사, 셰이더 워크플로 등을 16개 이상의 MCP 도구와 13개의 도메인 지식 파일로 지원합니다.

> **핵심 개념:**
>
> • **MCP(Model Context Protocol):** AI 어시스턴트가 개발 도구와 통신하기 위한 표준 프로토콜  
> • **Scene(씬):** Godot의 기본 구성 요소 — 노드 트리를 재사용 가능한 파일(.tscn)로 저장  
> • **Node(노드):** 씬 트리의 기본 단위; Godot에서 모든 것은 Node를 상속  
> • **Signal(시그널):** 느슨한 결합의 노드 간 통신을 위한 Observer 패턴 구현  
> • **GDScript:** Godot 내장 스크립팅 언어, Python 스타일 문법과 정적 타이핑 지원  
> • **Resource(리소스):** Godot이 디스크에서 읽고 쓰는 모든 데이터(.tres, 텍스처, 오디오 등)

## 기능

- **씬 관리** — 씬 생성·수정·저장; 6개 스캐폴드 템플릿으로 완전한 씬 구조 생성
- **GDScript 생성** — 타입 안전 스크립트 생성(시그널, export 변수, 상태 머신, 컴포넌트 패턴)
- **에셋 파이프라인** — 임포트 프리셋, 미사용 에셋 감지, 참조 검증, 포맷 최적화
- **빌드 자동화** — 멀티 플랫폼 내보내기(Windows/macOS/Linux/Web/Android/iOS), 헤드리스 CLI 빌드
- **성능 분석** — 12개 안티패턴 감지, 프레임 버짓 분석, 메모리 프로파일링
- **코드 품질** — 네이밍 규칙 강제, 시그널 결합도 분석, 순환 의존성 감지
- **셰이더 워크플로** — 텍스트 & VisualShader 템플릿, 플랫폼 호환성 검증
- **TileMap 도구** — TileSet 설정, Terrain 세트, 물리/내비게이션 레이어
- **애니메이션 시스템** — AnimationTree 상태 머신, BlendTree 설정, Tween 패턴
- **UI 시스템** — Control 노드 계층, Theme 생성, 반응형 레이아웃, 접근성
- **Signal 아키텍처** — Event Bus 패턴, 결합도 그래프, 느슨한 결합 통신
- **멀티플레이어** — RPC 패턴, MultiplayerSpawner/Synchronizer, 전용 서버 설정

## 아키텍처

```
개발자 (자연어)
    → AI 레이어 (의도 이해 & 계획)
        → MCP 프로토콜
            → Godot Editor (실행 레이어)

Godot Accelerator (인텔리전스 레이어)
├── POWER.md        → 도구와 워크플로를 정의하는 메인 문서
├── steering/       → 13개 도메인 지식 파일
├── templates/      → 30+ JSON 템플릿 (7개 카테고리)
└── src/            → 12개 TypeScript 분석 모듈
```

## 필수 조건

- [Godot Engine 4.3+](https://godotengine.org/download/) (UID 지원을 위해 4.4+ 권장)
- [Kiro IDE](https://kiro.dev/docs/getting-started/installation)
- [Node.js 18+](https://nodejs.org/) 및 npm
- [godot-mcp](https://github.com/bradypp/godot-mcp) clone 및 build 완료

## 설치

### 단계 1 — Kiro에 이 Power 설치

Kiro 열기 → 왼쪽 패널에서 Powers 아이콘 클릭 → "+" 클릭 → "Add Custom Power" 선택 → 이 프로젝트의 루트 디렉토리 선택

### 단계 2 — godot-mcp 설치 및 빌드

```bash
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp
npm install
npm run build
```

### 단계 3 — MCP 연결 설정

`mcp.json` 또는 `.kiro/settings/mcp.json`을 편집:

**Windows:**
```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\<사용자명>\\path\\to\\godot-mcp\\build\\index.js"],
      "env": {
        "GODOT_PATH": "C:\\Program Files\\Godot\\Godot_v4.4-stable_win64.exe",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

**macOS / Linux:**
```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/Users/<YOU>/path/to/godot-mcp/build/index.js"],
      "env": {
        "GODOT_PATH": "/Applications/Godot.app/Contents/MacOS/Godot",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

### 단계 4 — 자동 가이던스 Hook 설치 (권장)

```bash
mkdir -p .kiro/hooks
cp hooks/pre-godot-tool.kiro.hook .kiro/hooks/
```

### 연결 확인

Kiro에서 아무 Godot 관련 명령을 입력하세요 (예: "설치된 Godot 버전을 보여줘"). AI가 올바르게 응답하면 연결 성공입니다.

## 사용 방법

설치 완료 후, Kiro에 자연어로 말하기만 하면 됩니다. AI가 자동으로 Power를 활성화하고 적절한 MCP 도구를 선택하여 작업을 실행합니다.

### 이렇게 물어볼 수 있습니다

| 분야 | 예시 명령 |
|------|-----------|
| 씬 | "2D 플랫포머 씬을 만들어줘", "메인 메뉴 UI를 만들어줘" |
| GDScript | "상태 머신이 포함된 플레이어 컨트롤러를 생성해줘", "Event Bus 싱글톤을 만들어줘" |
| 에셋 | "미사용 에셋을 확인해줘", "픽셀 아트 임포트 프리셋을 설정해줘" |
| 성능 | "성능 안티패턴을 스캔해줘", "최적화 리포트를 생성해줘" |
| 품질 | "네이밍 규칙을 검사해줘", "시그널 결합도를 분석해줘" |
| 셰이더 | "스프라이트 아웃라인 셰이더를 만들어줘", "디졸브 이펙트를 만들어줘" |
| 빌드 | "Windows 릴리스 버전을 내보내줘", "Web 버전을 빌드해줘" |
| 플랫폼 | "내 프로젝트가 iOS와 호환되나요?", "모바일 메모리 버짓을 확인해줘" |
| TileMap | "Terrain 자동 타일링이 있는 TileSet을 설정해줘" |
| 애니메이션 | "Idle/Run/Jump 상태 머신을 만들어줘" |
| 멀티플레이어 | "ENet 멀티플레이어를 설정해줘" |

### 워크플로 예시: 2D 플랫포머 빌드

```
1. "TileMap 지형, 플레이어, 카메라가 포함된 새 2D 플랫포머 씬을 만들어줘"

2. "이동, 점프, 코요테 타임, 애니메이션 상태가 있는 플레이어 컨트롤러를 생성해줘"

3. "플레이어 상태 머신 생성: Idle, Run, Jump, Fall 상태와 올바른 전환"

4. "플레이어에 체력 컴포넌트 추가: 데미지, 힐, 무적 프레임 포함"

5. "Event Bus 글로벌 시그널 설정: player_died, score_changed, level_completed"

6. "모든 스크립트의 성능 안티패턴과 네이밍 규칙 위반을 스캔"

7. "Web과 Windows 버전을 내보내기"
```

## 공식 Godot 문서 참조

| 분야 | 공식 문서 링크 |
|------|---------------|
| GDScript 스타일 | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html |
| 정적 타이핑 | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html |
| 씬 구성 | https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html |
| 시그널 | https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html |
| 성능 베스트 프랙티스 | https://docs.godotengine.org/en/stable/tutorials/performance/index.html |
| 내보내기 | https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html |
| 셰이더 | https://docs.godotengine.org/en/stable/tutorials/shaders/index.html |
| AnimationTree | https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html |
| TileMap | https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html |
| 멀티플레이어 | https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html |
| UI/Control | https://docs.godotengine.org/en/stable/tutorials/ui/index.html |
| 에셋 임포트 | https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html |
| 프로젝트 구성 | https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html |
| 커맨드 라인 | https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html |

## 문제 해결

| 문제 | 해결책 |
|------|--------|
| "Godot 실행 파일을 찾을 수 없습니다" | mcp.json에서 `GODOT_PATH` 환경 변수를 설정 |
| MCP 도구가 응답하지 않음 | godot-mcp가 빌드되었는지 확인 (`npm run build`), 경로가 올바른지 확인 |
| "유효하지 않은 프로젝트 경로" | `project.godot`을 포함하는 절대 경로를 제공 |
| UID 도구가 작동하지 않음 | Godot 4.4+ 필요; 이전 버전은 `res://` 경로 사용 |

## 라이선스

MIT License. [LICENSE](LICENSE) 파일을 참조하세요.
