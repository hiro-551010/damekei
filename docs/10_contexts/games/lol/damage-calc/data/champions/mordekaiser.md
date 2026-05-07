# Mordekaiser（モルデカイザー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Obliterate） | magic。Meraki 値をそのまま使用 |
| W（Indestructible） | ダメージなし（シールド生成）。preMitigation = 0 で問題なし |
| E（Death's Grasp） | magic。Meraki 値をそのまま使用 |
| R（Realm of Death） | magic。Meraki が R 発動時のダメージ値を返す |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Darkness Rise） | AA / スキル 3 ヒット後に AA と周囲に追加 magic ダメージ。条件付き発動のため計算機では対応しない |
