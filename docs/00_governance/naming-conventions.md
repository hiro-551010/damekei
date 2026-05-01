# 命名規則

コンテキスト名（例：`task`）はファイルパスで表現されるため、クラス名に原則繰り返さない。

---

## ドメイン層

| 種別 | 命名 | 例 |
|---|---|---|
| Aggregate | コンテキスト名（単数形） | `Task` / `User` |
| ValueObject | 概念名 | `TaskId` / `Title` / `DueDate` / `TaskStatus` |
| Repository IF | コンテキスト名 + `Repository` | `TaskRepository` / `UserRepository` |
| Domain Event | コンテキスト名 + イベント名（過去形） | `TaskCreated` / `TaskStatusChanged` |

### 理由

- Aggregate はそのコンテキストの中心概念であり、コンテキスト名そのままが最も明確
- ValueObject は何を表す値かを名前で示す
- Repository IF はドメイン層に置くため、実装詳細（Impl）を含めない

---

## アプリケーション層

| 種別 | 命名 | 例 |
|---|---|---|
| コマンド | 動詞のみ | `Create` / `Update` / `ChangeStatus` / `Delete` |
| クエリ | 動詞のみ | `Get` / `GetAll` |
| ハンドラー | 動詞 + コンテキスト名 + `Handler` | `CreateTaskHandler` / `GetTaskHandler` |
| DTO | コンテキスト名 + `Dto` | `TaskDto` / `UserDto` |

### 理由

- コマンド・クエリ名はパス（`<ctx>/application/commands/create.ts`）がコンテキストを示すため繰り返し不要
- ハンドラーは presentation 層からインポートされるため、コンテキスト名を含めて明示的にする

---

## インフラ層

| 種別 | 命名 | 例 |
|---|---|---|
| Repository 実装 | コンテキスト名 + `RepositoryImpl` | `TaskRepositoryImpl` / `UserRepositoryImpl` |

### 理由

- `Impl` サフィックスで IF と実装を区別する

---

## プレゼンテーション層

ファイル名で役割を表現する。具体的なファイル構成はフレームワークに依存するため `docs/01_project/` を参照すること。

| 役割 | 命名パターン | 例 |
|---|---|---|
| ルーティング定義 | `router` / `controller` | `router.ts` / `task-controller.ts` |
| エラー変換 | `error-handler` | `error-handler.ts` |
