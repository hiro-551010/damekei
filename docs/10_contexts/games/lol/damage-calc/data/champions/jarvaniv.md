# Jarvan IV（ジャーヴァン IV）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Dragon Strike） | physical。Meraki 値をそのまま使用 |
| W（Golden Aegis） | ダメージなし（シールド）。preMitigation = 0 で問題なし |
| E（Demacian Standard） | magic。Meraki 値をそのまま使用 |
| R（Cataclysm） | physical。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Martial Cadence） | 同じ敵への初回ヒットで現在 HP の 6〜10% 追加物理ダメージ。現在 HP% スケーリングは skillモデルで表現できないため対応しない |
