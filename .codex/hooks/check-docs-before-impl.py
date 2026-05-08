#!/usr/bin/env python3
"""
PreToolUse hook: 実装ファイルを書く前に対応するdocsが存在するか確認する。
存在しない場合はツール呼び出しをハードブロックする。
ブロック後のdocs作成はエラーメッセージの指示に従うClaudeの振る舞いに依存する。
"""
import json
import os
import sys

data = json.load(sys.stdin)
file_path = data.get("file_path", "")

# app/src/contexts/ 以下のファイルのみチェック
if not file_path.startswith("app/src/contexts/"):
    sys.exit(0)

rel_path = file_path[len("app/src/contexts/"):]
parts = rel_path.split("/")

# レイヤーを検索
LAYERS = {"application", "domain", "infrastructure", "presentation"}
layer_idx = None
for i, part in enumerate(parts):
    if part in LAYERS:
        layer_idx = i
        break

if layer_idx is None:
    sys.exit(0)

ctx_path = "/".join(parts[:layer_idx])  # e.g., games/lol/damage-calc
layer = parts[layer_idx]

# infrastructure はdocs不要
if layer == "infrastructure":
    sys.exit(0)

# ファイル名を .md に変換 (例: dto.ts → dto.md, LolPage.tsx → LolPage.md)
impl_filename = parts[-1]  # e.g., dto.ts
stem = impl_filename.rsplit(".", 1)[0]  # e.g., dto
expected_doc = f"{stem}.md"

if layer == "presentation":
    # presentation はディレクトリ単位でチェック（コンポーネント単体にdocs不要）
    docs_dir = f"docs/30_frontend/{ctx_path}"
    if not os.path.isdir(docs_dir) or not any(
        f.endswith(".md") for f in os.listdir(docs_dir)
    ):
        print(
            f"⛔ docsが存在しません: {docs_dir}/\n"
            f"実装前に対応するdocsファイルを作成し、ユーザーに確認を取ってください。",
            file=sys.stderr,
        )
        sys.exit(2)
else:
    # application / domain はファイル単位でチェック（サブディレクトリ含む）
    sub_path = "/".join(parts[layer_idx + 1:-1])  # e.g., "services" or ""
    doc_dir = f"docs/10_contexts/{ctx_path}/{layer}/{sub_path}" if sub_path else f"docs/10_contexts/{ctx_path}/{layer}"
    docs_path = f"{doc_dir}/{expected_doc}"
    # models.ts は model.md でも可（既存の命名慣習との互換）
    alt_docs_path = None
    if stem == "models":
        alt_docs_path = f"docs/10_contexts/{ctx_path}/{layer}/model.md"
    if not os.path.isfile(docs_path) and not (alt_docs_path and os.path.isfile(alt_docs_path)):
        print(
            f"⛔ docsが存在しません: {docs_path}\n"
            f"実装前にこのdocsファイルを作成し、ユーザーに確認を取ってください。",
            file=sys.stderr,
        )
        sys.exit(2)

sys.exit(0)
