# 例外処理ポリシー

## 例外の分類（必須）

本プロジェクトのエラーは必ず以下のどれかに分類する。

1. **DomainError（ビジネス例外）**
   - ビジネスルール/不変条件違反
   - 例：値オブジェクトの不正、状態遷移不可、在庫不足 等

2. **ApplicationError（ユースケース例外）**
   - ユースケース実行上の失敗
   - 例：対象が存在しない、権限不足、同時更新競合、外部I/F失敗を「業務上の失敗」として扱う場合 等

3. **InfrastructureError（インフラ例外）**
   - DB/ネットワーク/SDK/タイムアウト等の技術的失敗
   - 原則として domain には入れない

4. **UnexpectedError（想定外）**
   - バグ、未分類、ヌル参照、型不整合など
   - 必ず監視対象（alert）として扱う

---

## 層ごとの責務（必須）

### domain
- **DomainError だけを定義**する（例外/エラー型でもOK）
- インフラ例外を見ない（DB/HTTP/SDKを知らない）
- 例外/エラーは「何が悪いか」を明確にする（原因の曖昧化禁止）

### application
- domainの結果（成功/失敗）を解釈して **ApplicationError に変換**してよい
- repository/外部I/Fの失敗を受け取り、以下のどちらかにする：
  - (a) リトライ/フォールバック等で吸収
  - (b) ApplicationError として上位へ返す（ユーザーに見せる失敗）
  - (c) InfrastructureError として上位へ伝播（想定外・運用対象）
- ユースケース境界で **必ず例外境界を持つ**（握りつぶし禁止）

### infrastructure
- 例外は原則 InfrastructureError として表現
- DB固有例外/SDK例外はここで集約し、applicationに「意味のある失敗」として返す

### presentation
- applicationからのエラーを **外部表現に変換**する
  - HTTPなら status code + error body
  - CLIなら exit code
  - messagingなら nack/retry/dead-letter
- 例外をログに出す（機密はマスク）

---

## HTTPマッピング（標準）

presentation(HTTP) は以下を標準とする（必要に応じてctxで拡張可）。

- DomainError（入力/不変条件違反） → **400 Bad Request**
- ApplicationError（未認可） → **401/403**
- ApplicationError（存在しない） → **404 Not Found**
- ApplicationError（競合） → **409 Conflict**
- InfrastructureError（外部/DB失敗） → **503 Service Unavailable**
- UnexpectedError → **500 Internal Server Error**

---

## エラーレスポンス（標準）

外部に返すエラーは最低限この形を維持する（項目追加は可、削除は原則不可）。

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": { "optional": "object" },
    "trace_id": "string"
  }
}
```

- `code`：機械判定用（例：`audio.invalid_duration`）
- `message`：ユーザー向け（機密禁止）
- `details`：安全な追加情報（PII/秘密情報禁止）
- `trace_id`：ログ相関用

---

## ログ（例外時の必須ルール）

- InfrastructureError / UnexpectedError は **必ず error レベル**でログ
- DomainError / ApplicationError は **warn または info**（運用方針に合わせる）
- 機密情報（鍵、トークン、個人情報、決済情報）をログに出さない
- trace_id を必ず付与
