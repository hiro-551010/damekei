# Bel'Veth（ベル＝ヴェス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Void Surge） | physical。4方向のうち各1方向分のダメージを Meraki が返す |
| W（Above and Below） | physical。Meraki 値をそのまま使用 |
| E（Royal Maelstrom） | physical。Meraki 値をそのまま使用 |
| R（Endless Banquet） | physical。変身スキル。キャスト時のダメージ値を Meraki が返す |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Death in Lavender） | キルごとに永続 AS を取得するが、ダメージ倍率には影響しない |
| R 変身後 AA 追加真ダメージ | 変身後は奇数 AA に追加真ダメージが発生するが、状況依存のため対応しない |
