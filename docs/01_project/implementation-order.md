# 実装順序（このプロジェクト）

汎用的な DDD 実装順序の原則は `docs/00_governance/implementation-order.md` を参照すること。

---

## 順序

ドキュメント → ドメイン層 → アプリケーション層 → インフラ層 → プレゼンテーション層 → **フロントエンド画面（`docs/30_frontend/<ctx>/`）** → テスト

## 追加ステップの理由

ダメけい！はフロントエンド主体のサービス。bounded-context の presentation 層（React コンポーネント）に加えて、画面遷移・レイアウト・UX の設計が `docs/30_frontend/<ctx>/` に集約される。

そのため、各 context の実装が一通り完了した後、`docs/30_frontend/<ctx>/` に従って画面を組み上げる工程を明示的に追加ステップとして挟む。

---

## Phase ごとの着手範囲

| Phase | 実装する Context | 主な機能 |
|---|---|---|
| 1 | `games/pokemon/damage-calc` | ポケモンのダメージ計算（クライアント完結、DB不要） |
| 2 | `builds` | 構築シェア（DB・認証導入、全ゲーム横断） |
| 3 | `games/pokemon/phantom-pokemon` | 架空ポケモン生成（既存 context への組み込み含む） |

各 Phase 内では、上記の順序を厳守する。Phase をまたぐ実装は別ブランチ・別 PR で行う。

---

## 新ゲーム追加時の手順

1. `docs/10_contexts/games/<game>/damage-calc/` にドキュメントを作成（コンテキスト定義・ドメインモデル・ユースケース）
2. `docs/30_frontend/games/<game>/damage-calc/` に画面設計を作成
3. Docs ゲートをパスしてから `contexts/games/<game>/damage-calc/` を実装する
4. `app/src/app/(games)/<game>/damage-calc/page.tsx` を追加する
5. `builds` コンテキストの `gameId` 型に新ゲームを追加する
