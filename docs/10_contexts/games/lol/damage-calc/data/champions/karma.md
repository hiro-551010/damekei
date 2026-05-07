# Karma（カルマ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Inner Flame） | magic。Meraki 値をそのまま使用 |
| W（Focused Resolve） | magic。Meraki 値をそのまま使用 |
| E（Inspire） | ダメージなし（シールド付与）。preMitigation = 0 で問題なし |
| R（Mantra） | ダメージなし（次のスキルを強化）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Gathering Fire） | AA / スキルヒットで R のクールダウンを短縮。ダメージ出力に影響なし |
| R（Mantra）強化スキルのボーナスダメージ | Mantra 付き Q/W/E は大幅に性能が向上するが、形態変化として個別対応が必要なため対応しない |
