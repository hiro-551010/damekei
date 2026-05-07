# Poppy（ポッピー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Hammer Shock） | physical。Meraki 値をそのまま使用 |
| W（Steadfast Presence） | ダメージなし（魔法シールド・スロー）。preMitigation = 0 で問題なし |
| E（Heroic Charge） | physical。Meraki 値をそのまま使用 |
| R（Keeper's Verdict） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | E は壁に激突するとボーナスダメージ。Meraki が壁激突あり・なしどちらを返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Iron Ambassador） | 数回 AA ごとにバックラーを投擲して physical ダメージ。条件付き周期発動のため計算機では対応しない |
