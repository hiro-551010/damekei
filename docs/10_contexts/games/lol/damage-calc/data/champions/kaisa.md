# Kai'Sa（カイサ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Icathian Rain） | physical。Meraki が基本ミサイル（未進化）のダメージ値を返す |
| W（Void Seeker） | magic。Meraki 値をそのまま使用 |
| E（Supercharge） | physical。AS 増加中の強化 AA のダメージ値を Meraki が返す |
| R（Killer Instinct） | ダメージなし（ダッシュのみ）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はボーナス AD・AP・AS によって進化する。Meraki が未進化時の値を返しているかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Second Skin / Plasma） | AA の Plasma スタックは 5 スタック目に最大 HP% の magic ダメージを与える。HP% スケーリングのため計算機では対応しない |
