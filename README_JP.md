# Kiro Godot Accelerator

[English](README.md) | [繁體中文](README_TW.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> **言語に関する注記：** Steering ファイル（ドメイン知識）は繁体字中国語で記述されており、各ファイル冒頭に英語の要約セクションがあります。Power は開発者の希望する言語で応答します。言語の問題がありましたら、Issue を作成してコミュニティサポートを受けてください。

IDEをGodot Engineの開発AIアシスタントに変身させます。MCP（Model Context Protocol）を通じて自然言語でGodot Editorを操作できます。シーン管理、GDScript生成、アセットパイプライン、ビルド自動化、パフォーマンス分析、コード品質チェック、Shaderワークフローなどを16以上のMCPツールと13のドメイン知識ファイルで対応します。

> **主要コンセプト：**
>
> • **MCP（Model Context Protocol）：** AIアシスタントが開発ツールと通信するための標準プロトコル  
> • **Scene（シーン）：** Godotの基本構成要素 — ノードツリーを再利用可能なファイル（.tscn）として保存  
> • **Node（ノード）：** シーンツリーの基本単位；GodotではすべてがNodeを継承  
> • **Signal（シグナル）：** 疎結合ノード間通信のためのObserverパターン実装  
> • **GDScript：** Godotのビルトインスクリプティング言語、Python風の構文と静的型付けに対応  
> • **Resource（リソース）：** Godotがディスクから読み書きするすべてのデータ（.tres、テクスチャ、オーディオなど）

## 機能

- **シーン管理** — シーンの作成・変更・保存；6つのスキャフォールドテンプレートから完全なシーン構造を生成
- **GDScript生成** — 型安全なスクリプト生成（シグナル、エクスポート変数、ステートマシン、コンポーネントパターン対応）
- **アセットパイプライン** — インポートプリセット、未使用アセット検出、参照検証、フォーマット最適化
- **ビルド自動化** — マルチプラットフォームエクスポート（Windows/macOS/Linux/Web/Android/iOS）、ヘッドレスCLIビルド
- **パフォーマンス分析** — 12種のアンチパターン検出、フレームバジェット分析、メモリプロファイリング
- **コード品質** — 命名規則の強制、シグナル結合度分析、循環依存検出
- **Shaderワークフロー** — テキスト＆VisualShaderテンプレート、プラットフォーム互換性検証
- **TileMapツール** — TileSet設定、Terrainセット、物理/ナビゲーションレイヤー
- **アニメーションシステム** — AnimationTreeステートマシン、BlendTree設定、Tweenパターン
- **UIシステム** — Controlノード階層、Theme生成、レスポンシブレイアウト、アクセシビリティ
- **Signalアーキテクチャ** — Event Busパターン、結合度グラフ、疎結合通信
- **マルチプレイヤー** — RPCパターン、MultiplayerSpawner/Synchronizer、専用サーバー設定

## アーキテクチャ

```
開発者（自然言語）
    → AIレイヤー（意図理解と計画）
        → MCPプロトコル
            → Godot Editor（実行レイヤー）

Godot Accelerator（インテリジェンスレイヤー）
├── POWER.md        → ツールとワークフローを定義するメインドキュメント
├── steering/       → 13のドメイン知識ファイル
├── templates/      → 30+ JSONテンプレート（7カテゴリ）
└── src/            → 12のTypeScript分析モジュール
```

## 前提条件

- [Godot Engine 4.3+](https://godotengine.org/download/)（UID対応には4.4+推奨）
- [Kiro IDE](https://kiro.dev/docs/getting-started/installation)
- [Node.js 18+](https://nodejs.org/) と npm
- [godot-mcp](https://github.com/bradypp/godot-mcp) がclone済み・build済み

## インストール

### ステップ 1 — KiroにこのPowerをインストール

Kiroを開く → 左パネルのPowersアイコンをクリック → 「+」をクリック → 「Add Custom Power」を選択 → このプロジェクトのルートディレクトリを選択

### ステップ 2 — godot-mcpのインストールとビルド

```bash
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp
npm install
npm run build
```

### ステップ 3 — MCP接続の設定

`mcp.json` または `.kiro/settings/mcp.json` を編集：

**Windows：**
```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\<ユーザー名>\\path\\to\\godot-mcp\\build\\index.js"],
      "env": {
        "GODOT_PATH": "C:\\Program Files\\Godot\\Godot_v4.4-stable_win64.exe",
        "DEBUG": "false",
        "READ_ONLY": "false"
      }
    }
  }
}
```

**macOS / Linux：**
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

### ステップ 4 — 自動ガイダンスHookのインストール（推奨）

```bash
mkdir -p .kiro/hooks
cp hooks/pre-godot-tool.kiro.hook .kiro/hooks/
```

### 接続確認

Kiroで任意のGodot関連コマンドを入力してください（例：「インストールされているGodotのバージョンを表示して」）。AIが正しく応答すれば、接続成功です。

## 使い方

インストール完了後、Kiroに自然言語で話しかけるだけです。AIが自動的にPowerをアクティベートし、適切なMCPツールを選択して操作を実行します。

### こんなことが聞けます

| 分野 | コマンド例 |
|------|-----------|
| シーン | 「2Dプラットフォーマーシーンを作成して」、「メインメニューUIを作って」 |
| GDScript | 「ステートマシン付きのプレイヤーコントローラーを生成して」、「Event Busシングルトンを作成して」 |
| アセット | 「未使用アセットをチェックして」、「ピクセルアートのインポートプリセットを設定して」 |
| パフォーマンス | 「パフォーマンスのアンチパターンをスキャンして」、「最適化レポートを生成して」 |
| 品質 | 「命名規則をチェックして」、「シグナルの結合度を分析して」 |
| Shader | 「スプライトのアウトラインシェーダーを作成して」、「ディゾルブエフェクトを作って」 |
| ビルド | 「Windowsリリース版をエクスポートして」、「Web版をビルドして」 |
| プラットフォーム | 「このプロジェクトはiOS対応ですか？」、「モバイルのメモリバジェットをチェックして」 |
| TileMap | 「Terrain自動タイリング付きTileSetを設定して」 |
| アニメーション | 「Idle/Run/Jumpステートマシンを作成して」 |
| マルチプレイヤー | 「ENetマルチプレイヤーを設定して」 |

### ワークフロー例：2Dプラットフォーマーの構築

```
1. "TileMap地形、プレイヤー、カメラを含む新しい2Dプラットフォーマーシーンを作成して"

2. "移動、ジャンプ、コヨーテタイム、アニメーション状態を持つプレイヤーコントローラーを生成して"

3. "プレイヤーのステートマシンを作成：Idle、Run、Jump、Fall状態と適切な遷移"

4. "プレイヤーにHPコンポーネントを追加：ダメージ、回復、無敵フレーム付き"

5. "Event Busグローバルシグナルを設定：player_died、score_changed、level_completed"

6. "全スクリプトのパフォーマンスアンチパターンと命名規則違反をスキャン"

7. "WebとWindows版をエクスポート"
```

## 公式Godotドキュメント参照

| 分野 | 公式ドキュメントリンク |
|------|---------------------|
| GDScriptスタイル | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html |
| 静的型付け | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html |
| シーン構成 | https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html |
| シグナル | https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html |
| パフォーマンス | https://docs.godotengine.org/en/stable/tutorials/performance/index.html |
| エクスポート | https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html |
| Shader | https://docs.godotengine.org/en/stable/tutorials/shaders/index.html |
| AnimationTree | https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html |
| TileMap | https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html |
| マルチプレイヤー | https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html |
| UI/Control | https://docs.godotengine.org/en/stable/tutorials/ui/index.html |
| アセットインポート | https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html |
| プロジェクト構成 | https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html |
| コマンドライン | https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html |

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 「Godot実行ファイルが見つかりません」 | mcp.jsonで`GODOT_PATH`環境変数を設定 |
| MCPツールが応答しない | godot-mcpがbuild済みか確認（`npm run build`）、パスが正しいか確認 |
| 「無効なプロジェクトパス」 | `project.godot`を含む絶対パスを指定 |
| UIDツールが動作しない | Godot 4.4+が必要；それ以前は`res://`パスを使用 |

## ライセンス

MIT License。[LICENSE](LICENSE)ファイルを参照してください。
