# Ivern（アイバーン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Rootcalling） | magic。Meraki 値をそのまま使用 |
| W（Brushmaker） | ダメージなし（茂み生成）。preMitigation = 0 で問題なし |
| E（Triggerseed） | magic。シールドが弾ける際のダメージを Meraki が返す |
| R（Daisy!） | ダメージなし（デイジー召喚）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Friend of the Forest） | ジャングル狩り補助・HP/MP 回復。ダメージ出力に影響なし |
| Daisy のダメージ | Daisy（ゴーレム）が行う physical ダメージは召喚物由来のため計算機では対応しない |
