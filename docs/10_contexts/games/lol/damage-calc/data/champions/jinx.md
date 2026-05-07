# Jinx（ジンクス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Switcheroo!） | physical。Meraki がミニガンまたはロケットランチャーのいずれかのボーナスダメージ値を返す |
| W（Zap!） | physical。Meraki 値をそのまま使用 |
| E（Flame Chompers!） | physical。トラップのダメージ値を Meraki が返す |
| R（Super Mega Death Rocket!） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はトグルでミニガン（AS バフ）とロケットランチャー（AoE splash + bonus damage）を切り替える。Meraki がどちらの形態の値を返すかを確認すること。ロケット形態の場合は splash ダメージの合算か単体分かも確認 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Get Excited!） | テイクダウン時の移動速度増加。ダメージ出力に影響なし |
