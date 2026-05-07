# Orianna（オリアンナ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Command: Attack） | magic。Meraki 値をそのまま使用 |
| W（Command: Dissonance） | magic。Meraki 値をそのまま使用 |
| E（Command: Protect） | ダメージなし（シールド付与）。preMitigation = 0 で問題なし |
| R（Command: Shockwave） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Clockwork Windup） | 同一ターゲットへの 2 回目 AA に追加 magic ダメージ。条件付き発動のため計算機では対応しない |
