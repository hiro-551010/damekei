# フロントエンドアーキテクチャ（このプロジェクト）

汎用原則は `docs/00_governance/frontend-principles.md` を参照すること。
ここではダメけい！固有の Next.js App Router 実装詳細を記述する。

---

## ディレクトリ構成

```
app/src/
├── app/                                # Next.js App Router（ルーティング層）
│   ├── layout.tsx                      # ルートレイアウト
│   ├── page.tsx                        # / → damage-calc にリダイレクト or そのまま表示
│   └── damage-calc/
│       └── page.tsx                    # /damage-calc ページ（Server Component）
│
└── contexts/
    └── damage-calc/
        └── presentation/
            ├── DamageCalcPage.tsx      # ページ全体のコンテナ（Client Component）
            ├── PokemonPanel.tsx        # 攻撃側 or 防御側のパラメータ入力パネル
            ├── PokemonSelect.tsx       # ポケモン選択（検索・絞り込み）
            ├── StatForm.tsx            # IVs / EVs 入力フォーム
            ├── MoveSelect.tsx          # わざ選択
            ├── FieldConditionForm.tsx  # フィールド状態（天候・テレイン）
            └── DamageResultDisplay.tsx # 計算結果表示
```

---

## Server Component と Client Component の分担

| コンポーネント | 種別 | 理由 |
|---|---|---|
| `app/damage-calc/page.tsx` | Server Component | 静的 JSON の import・初期データを props として渡す |
| `DamageCalcPage.tsx` | Client Component (`"use client"`) | フォーム状態管理・リアルタイム計算が必要 |
| `DamageResultDisplay.tsx` | Client Component | 親から受け取る props で描画（状態は持たない） |
| その他 presentation コンポーネント | Client Component | フォーム操作を含むため |

### データフロー

```
app/damage-calc/page.tsx（Server Component）
  │  静的 JSON を import して pokemonList を取得
  └── <DamageCalcPage pokemonList={pokemonList} />
           │  ユーザー操作 → useState で attacker / defender / move を管理
           └── CalculateDamage ユースケースを呼ぶ（ブラウザ上で @smogon/calc を実行）
                    └── <DamageResultDisplay result={result} />
```

---

## 状態管理方針

Phase 1 は React ビルトインのみ（`useState` / `useReducer`）。

| 状態 | 管理場所 |
|---|---|
| 攻撃側パラメータ | `DamageCalcPage` の `useState` |
| 防御側パラメータ | `DamageCalcPage` の `useState` |
| 選択中のわざ | `DamageCalcPage` の `useState` |
| フィールド状態 | `DamageCalcPage` の `useState` |
| 計算結果 | `DamageCalcPage` の `useState`（パラメータ変更時に自動再計算） |

計算はボタン押下ではなく **パラメータ変更時にリアルタイム実行** する。
`@smogon/calc` はブラウザ上で同期実行できるため、非同期処理不要。

---

## URL 設計

| パス | 画面 |
|---|---|
| `/` | `/damage-calc` にリダイレクト（Phase 1 はダメ計のみ） |
| `/damage-calc` | ダメージ計算画面 |

Phase 2 以降でパスが増えた場合は本ドキュメントを更新する。

---

## 命名規則（このプロジェクト）

汎用命名規則（`docs/00_governance/frontend-principles.md`）に加え、以下を適用する。

| 種別 | 規則 | 例 |
|---|---|---|
| ページコンポーネント | `<CtxPascal>Page.tsx` | `DamageCalcPage.tsx` |
| 機能コンポーネント | `<役割PascalCase>.tsx` | `PokemonPanel.tsx` / `DamageResultDisplay.tsx` |
| Server Component（page.tsx） | Next.js 規約に従い `page.tsx` 固定 | — |
