# Kog'Maw（コグマウ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Caustic Spittle） | magic。Meraki 値をそのまま使用 |
| W（Bio-Arcane Barrage） | magic。トグル中の AA オンヒット最大 HP% ダメージ値を Meraki が返す |
| E（Void Ooze） | magic。Meraki 値をそのまま使用 |
| R（Living Artillery） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W はトグルで AA に最大 HP の 3.5〜7.5%（+ AP 比率）の on-hit magic を追加する。Meraki がこの HP% 値をどのフィールドで返すかを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| W オンヒット最大 HP% | W の on-hit magic ダメージは最大 HP% + AP スケーリングのトグルスキル。`passiveSpec` の `onHitMaxHpPercent` は永続パッシブ・レベル配列前提のため、トグル＋ AP スケーリングには対応しない |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Icathian Surprise） | 死亡後の爆発ダメージ。自身のダメージ出力には影響しない |
