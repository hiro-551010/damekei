# ディレクトリ構造（このプロジェクト）

汎用的な構造原則（DDDレイヤー・テスト構造・docs階層等）は `docs/00_governance/directory-structure.md` を参照すること。

---

## 設計方針

- **ゲームごとにコンテキストを分ける**：ダメージ計算ロジックはゲームによって根本的に異なるため、`contexts/games/<game>/` 以下にゲーム固有コンテキストを配置する
- **構築保存はゲーム横断で共通化する**：セーブ・シェア機能はゲームに依存しないため、`contexts/builds/` として1つのコンテキストで全ゲームを扱う
- **ゲーム共通UIは `shared/components/` に置く**：SearchableSelect 等の再利用可能コンポーネントはゲーム固有コンテキストに含めない

---

```
damekei/
├── .obsidian/                               # Obsidian設定（Vault化の中核）
│
├── notes/                                   # 非公式ノート（Obsidianで管理）
│   ├── til/
│   ├── investigation/
│   ├── discussion/
│   └── meetings/
│
├── docs/                                    # 設計・仕様（正本）
│   ├── 00_governance/                       # 汎用ガバナンス
│   ├── 01_project/                          # プロジェクト固有
│   ├── 10_contexts/                         # bounded-context 別ドキュメント
│   │   ├── games/
│   │   │   ├── pokemon/
│   │   │   │   ├── damage-calc/             # Phase 1
│   │   │   │   └── phantom-pokemon/         # Phase 3（架空ポケモン）
│   │   │   └── lol/                        # League of Legends
│   │   │       └── damage-calc/
│   │   └── builds/                          # Phase 2（ゲーム横断の構築保存）
│   ├── 20_decisions/                        # 横断 ADR
│   └── 30_frontend/                         # フロントエンド設計（画面・コンポーネント）
│       ├── games/
│       │   ├── pokemon/
│       │   │   └── damage-calc/
│       │   └── lol/
│       │       └── damage-calc/
│       └── builds/                          # my-builds 画面（全ゲーム共通）
│
├── app/                                     # Next.js プロジェクト本体
│   ├── src/
│   │   ├── app/                             # App Router（presentation 層エントリ）
│   │   │   ├── (games)/                     # ルートグループ（URLには現れない）
│   │   │   │   └── pokemon/
│   │   │   │       └── damage-calc/
│   │   │   │           └── page.tsx         # /pokemon/damage-calc
│   │   │   ├── my-builds/
│   │   │   │   └── page.tsx                 # /my-builds（全ゲーム共通）
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                     # / トップ（ゲーム選択）
│   │   │   └── globals.css
│   │   │
│   │   ├── contexts/
│   │   │   ├── games/
│   │   │   │   ├── pokemon/
│   │   │   │   │   ├── damage-calc/         # ポケモン専用ダメ計
│   │   │   │   │   │   ├── domain/          # 外部依存なし
│   │   │   │   │   │   ├── application/     # ユースケース
│   │   │   │   │   │   ├── infrastructure/  # @smogon/calc アダプター等
│   │   │   │   │   │   └── presentation/    # ページ・コンポーネント
│   │   │   │   │   └── phantom-pokemon/     # Phase 3
│   │   │   │   └── lol/
│   │   │   │       └── damage-calc/
│   │   │   └── builds/                      # ゲーム横断の構築保存
│   │   │       ├── domain/                  # gameId + buildData:unknown
│   │   │       ├── application/
│   │   │       ├── infrastructure/          # Supabase
│   │   │       └── presentation/
│   │   │           ├── actions/
│   │   │           └── components/
│   │   │
│   │   ├── shared/
│   │   │   └── components/                  # ゲーム共通UIコンポーネント
│   │   │       └── SearchableSelect.tsx
│   │   │
│   │   └── shared_kernel/                   # ドメイン知識を含めない共通コード
│   │
│   ├── public/
│   ├── tests/                               # ユニット・統合テスト
│   ├── e2e/                                 # E2E テスト
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── Dockerfile
├── docker-compose.yml
├── CLAUDE.md
└── .gitignore
```

---

## bounded-context と docs の対応

| Context | 実装ディレクトリ | ドキュメント |
|---|---|---|
| `games/pokemon/damage-calc` | `app/src/contexts/games/pokemon/damage-calc/` | `docs/10_contexts/games/pokemon/damage-calc/`、`docs/30_frontend/games/pokemon/damage-calc/` |
| `games/pokemon/phantom-pokemon` | `app/src/contexts/games/pokemon/phantom-pokemon/` | `docs/10_contexts/games/pokemon/phantom-pokemon/` |
| `builds` | `app/src/contexts/builds/` | `docs/10_contexts/builds/`、`docs/30_frontend/builds/` |

---

## 注意事項

- `contexts/games/<game>/` 以下はゲーム固有ロジックのみ。他ゲームの名前・型を直接参照しない
- `contexts/builds/` の `buildData` は `unknown` 型（JSONB）で持ち、ゲーム固有の解釈は各ゲームの presentation 層が行う
- `shared/components/` のコンポーネントはゲーム固有の型・ドメイン知識を持たない
- `/my-builds` はゲーム横断ページ。`builds` コンテキストの presentation から呼び出す
- 新ゲーム追加時は `contexts/games/<game>/` と `docs/10_contexts/games/<game>/` を同時に作成する
