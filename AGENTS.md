<!--VITE PLUS START-->

# Vite+：Web向け統合ツールチェーンの使い方

このプロジェクトはVite+を使用しています。Vite+はVite、Rolldown、Vitest、tsdown、Oxlint、Oxfmt、Vite Taskをベースに構築された統合ツールチェーンです。Vite+はランタイム管理、パッケージ管理、フロントエンドツールを`vp`という単一のグローバルCLIにまとめています。Vite+はViteとは別物ですが、`vp dev`や`vp build`を通じてViteを呼び出します。

## Vite+ ワークフロー

`vp`は開発ライフサイクル全体を管理するグローバルバイナリです。`vp help`でコマンド一覧を、`vp <command> --help`で特定コマンドの情報を確認できます。

### 開始

- create - テンプレートから新しいプロジェクトを作成
- migrate - 既存プロジェクトをVite+に移行
- config - フックとエージェント連携の設定
- staged - ステージされたファイルにリンターを実行
- install (`i`) - 依存関係のインストール
- env - Node.jsバージョンの管理

### 開発

- dev - 開発サーバーを起動
- check - フォーマット、リント、TypeScript型チェックを実行
- lint - コードをリント
- fmt - コードをフォーマット
- test - テストを実行

### 実行

- run - モノレポタスクを実行
- exec - ローカルの`node_modules/.bin`からコマンドを実行
- dlx - 依存関係としてインストールせずにパッケージバイナリを実行
- cache - タスクキャッシュの管理

### ビルド

- build - 本番向けにビルド
- pack - ライブラリをビルド
- preview - 本番ビルドをプレビュー

### 依存関係の管理

Vite+は`package.json`の`packageManager`フィールドやパッケージマネージャー固有のロックファイルを通じて、pnpm、npm、Yarnなどの基盤となるパッケージマネージャーを自動検出してラップします。

- add - 依存関係にパッケージを追加
- remove (`rm`, `un`, `uninstall`) - 依存関係からパッケージを削除
- update (`up`) - パッケージを最新バージョンに更新
- dedupe - 依存関係の重複を解消
- outdated - 古くなったパッケージを確認
- list (`ls`) - インストール済みパッケージを一覧表示
- why (`explain`) - パッケージがインストールされている理由を表示
- info (`view`, `show`) - レジストリからパッケージ情報を表示
- link (`ln`) / unlink - ローカルパッケージリンクの管理
- pm - パッケージマネージャーにコマンドを転送

### メンテナンス

- upgrade - `vp`自体を最新バージョンに更新

これらのコマンドはそれぞれ対応するツールにマッピングされています。例えば、`vp dev --port 3000`はViteの開発サーバーを起動し、Viteと同じように動作します。`vp test`はバンドル済みのVitestでJavaScriptテストを実行します。全ツールのバージョンは`vp --version`で確認できます。これはドキュメント、機能、バグを調査する際に役立ちます。

## よくある落とし穴

- **パッケージマネージャーを直接使用する:** pnpm、npm、Yarnを直接使用しないでください。Vite+がすべてのパッケージ管理操作を処理できます。
- **ツールの実行には必ずViteコマンドを使用する:** `vp vitest`や`vp oxlint`は存在しません。代わりに`vp test`と`vp lint`を使用してください。
- **スクリプトの実行:** Vite+のコマンドは`package.json`のスクリプトより優先されます。`scripts`に定義された`test`スクリプトが組み込みの`vp test`コマンドと競合する場合は、`vp run test`で実行してください。
- **Vitest、Oxlint、Oxfmt、tsdownを直接インストールしない:** Vite+がこれらのツールをラップしています。直接インストールしてはいけません。最新バージョンをインストールしてこれらのツールをアップグレードすることはできません。常にVite+コマンドを使用してください。
- **一回限りのバイナリにはVite+ラッパーを使用する:** パッケージマネージャー固有の`dlx`/`npx`コマンドの代わりに`vp dlx`を使用してください。
- **JavaScriptモジュールは`vite-plus`からインポートする:** `vite`や`vitest`からインポートする代わりに、プロジェクトの`vite-plus`依存関係からインポートしてください。例えば、`import { defineConfig } from 'vite-plus';`や`import { expect, test, vi } from 'vite-plus/test';`のように記述します。テストユーティリティをインポートするために`vitest`をインストールしてはいけません。
- **型対応リンティング:** `oxlint-tsgolint`をインストールする必要はありません。`vp lint --type-aware`がそのまま動作します。

## エージェント向けレビューチェックリスト

- [ ] リモートの変更を取得した後、作業を始める前に`vp install`を実行する。
- [ ] `vp check`と`vp test`を実行して変更を検証する。
<!--VITE PLUS END-->
