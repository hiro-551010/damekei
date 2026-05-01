# フロントエンド設計（builds）

全ゲーム横断の構築保存・シェア画面。

> **移行メモ**：旧 `docs/30_frontend/team-builds/` から移動。
> `gameId` 対応に伴い `SaveBuildButton` が `gameId` prop を受け取るよう変更が必要。

## 画面一覧

| パス | 画面名 | 認証 |
|---|---|---|
| `/auth/login` | ログイン | 不要 |
| `/auth/signup` | サインアップ | 不要 |
| `/my-builds` | 自分の構築一覧（全ゲーム） | 必須 |
| `/<game>/damage-calc?build=<shareToken>` | 共有構築の読み込み | 不要 |

---

## コンポーネント構成

```
app/src/app/
├── auth/
│   ├── login/page.tsx
│   └── signup/page.tsx
└── my-builds/
    └── page.tsx                # 全ゲームの構築一覧

app/src/contexts/builds/presentation/
├── components/
│   ├── BuildCard.tsx           # 構築一覧の1件カード（ゲームバッジ付き）
│   ├── SaveBuildButton.tsx     # ゲーム画面に置く「構築を保存」ボタン（gameId prop を受け取る）
│   └── MyBuildsPage.tsx        # 構築一覧ページ本体
└── actions/
    ├── saveBuild.ts
    ├── deleteBuild.ts
    └── getMyBuilds.ts
```

---

## 各画面・コンポーネント仕様

### ログイン画面（`/auth/login`）

- メールアドレス + パスワードでログイン
- Google ログインボタン（Supabase Auth の OAuth）
- ログイン成功後は `/my-builds` にリダイレクト

### サインアップ画面（`/auth/signup`）

- メールアドレス + パスワード + 確認用パスワードで登録

### 自分の構築一覧（`/my-builds`）

- 未認証の場合は `/auth/login` にリダイレクト
- 全ゲームの構築カード一覧（更新日時降順）
- 各カードにゲームバッジ（「ポケモン」「Palworld」等）を表示
- 各カードに：構築名・ゲームバッジ・共有URLコピーボタン・削除ボタン
- 新規保存は各ゲームの damage-calc 画面から行う

### SaveBuildButton

- `gameId` prop を受け取り、保存時に `builds` コンテキストへ渡す
- 各ゲームのダメージ計算画面ヘッダーに配置する

### 共有 URL の構造

- `/<game>/damage-calc?build=<shareToken>`（例：`/pokemon/damage-calc?build=abc123`）
- ページロード時に `GetBuildByShareToken` を呼び、各ゲームの計算画面に自動セット

---

## UX 方針

- **保存フロー**：各ゲームの damage-calc でパラメータ設定 → 「保存」ボタン → 構築名入力 → 共有URL発行
- **読み込みフロー**：共有URLを開く → 対応ゲームの damage-calc に自動ロード
- **未認証でも閲覧可能**：共有URLは認証なしで開ける
- **ゲーム横断一覧**：`/my-builds` は全ゲームの構築をまとめて表示する
