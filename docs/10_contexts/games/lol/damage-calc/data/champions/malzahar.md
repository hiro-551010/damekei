# Malzahar（マルザハール）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Call of the Void） | magic。Meraki 値をそのまま使用 |
| W（Void Swarm） | magic。ヴォイドリングの1ヒットあたりのダメージを Meraki が返す |
| E（Malefic Visions） | magic。DoT の合計ダメージを Meraki が返す |
| R（Nether Grasp） | magic。チャネル全体のダメージ合計を Meraki が返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W はヴォイドリング（召喚物）のダメージ。Meraki が召喚物の1ヒットあたり値を返すかを確認すること |
| E ダメージ値 | E は DoT で継続ダメージ。Meraki が全継続合計か1秒あたりかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Void Shift） | 非戦闘中のダメージ軽減シールド。ダメージ出力に影響なし |
