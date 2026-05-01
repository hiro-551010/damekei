# Git 運用ルール

## ブランチ戦略

```
main          # リリース済み・常に動作する状態
└── develop   # 統合ブランチ・次のリリース候補
    ├── feature/<ctx>/<slug>
    ├── fix/<ctx>/<slug>
    ├── docs/<ctx>/<slug>
    ├── docs/governance/<slug>
    ├── refactor/<ctx>/<slug>
    └── chore/<slug>          # ctx に依存しない場合は省略可
```

- `main` / `develop` への直接プッシュ禁止。必ず PR を経由する。
- ブランチの起点は必ず `develop`。
- マージ後はブランチを削除する。

---

## ブランチ命名規則

| プレフィックス | 用途 | 例 |
|---|---|---|
| `feature/` | 新機能 | `feature/task/add-status-transition` |
| `fix/` | バグ修正 | `fix/task/invalid-status-error` |
| `docs/<ctx>/` | `docs/10_contexts/<ctx>/` 配下のドキュメントのみの変更 | `docs/task/update-use-cases` |
| `docs/governance/` | ガバナンスドキュメント変更（`docs/00_governance/`・`CLAUDE.md`） | `docs/governance/add-docs-workflow` |
| `refactor/` | 振る舞いを変えないリファクタ | `refactor/task/extract-value-object` |
| `chore/` | ビルド・CI・依存更新・`docs/01_project/` 変更等 | `chore/update-drizzle` |

---

## コミット規約

### 形式

```
<type>(<ctx>): <概要>
```

- `type`：下記の種別から選ぶ
- `ctx`：対象の bounded-context（例：`task` `user`）。横断的な変更は省略可
- `概要`：日本語・命令形・句点なし

### type 一覧

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `refactor` | 振る舞いを変えないリファクタ |
| `test` | テストのみ |
| `chore` | ビルド・CI・依存更新等 |

### 例

```
feat(task): ステータス遷移を追加
fix(task): 期限切れタスクの取得クエリを修正
docs(task): use-cases.md にタスク完了フローを追記
test(task): ステータス遷移の境界値テストを追加
chore: drizzle-kit を最新版に更新
```

### ルール

- WIP コミット禁止。作業途中でも意味のある単位でコミットする。
  - **例外：** ガバナンス変更割り込み（CLAUDE.md 5.8）による一時退避時のみ WIP コミットを許可する。feature ブランチは squash merge されるため最終履歴には残らない。
- 1コミット = 1つの目的。複数の変更を混在させない。

---

## PRマージ方法

| マージ先 | 方法 | 理由 |
|---|---|---|
| `develop` ← `feature/*` | **Squash merge** | feature の細かい履歴を集約し develop のログを綺麗に保つ |
| `main` ← `develop` | **Squash merge** | main のログ = リリース単位になる |

Squash merge 時のコミットメッセージはコミット規約に従う。

---

## PR 規約

- PR タイトルはコミット規約の形式に従う（例：`feat(task): ステータス遷移を追加`）
- CI が緑でない PR はマージ禁止。
- `develop` → `main` の PR はリリースノートとして機能させる。
