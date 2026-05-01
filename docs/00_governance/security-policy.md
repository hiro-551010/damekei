# セキュリティ方針

- 秘密情報は環境変数管理。
- domain層に秘密情報を持ち込まない。
- ログに機密情報を出力しない。

## 認証・認可の層責務

| 責務 | 層 | 説明 |
|---|---|---|
| 認証（Authentication） | presentation | リクエストからトークン/セッションを検証し、認証情報を後続の層に渡す |
| 認可（Authorization） | application | ユースケース実行前に、認証済みユーザーが操作を許可されているか判定する |
| 認可ルール定義 | domain | 「誰が何をできるか」のビジネスルールは domain 層で定義してよい |

- 認証の実装詳細（JWT 検証、OAuth 等）は infrastructure 層に置く。
- presentation 層のミドルウェアが infrastructure 層の認証実装を呼び出す構成が標準。
- 認証・認可を独立した Bounded Context とするかは、プロジェクト規模に応じて判断する。
