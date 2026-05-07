# Kled（クレッド）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

Kled はスカール搭乗時と落馬時でスキルが変化する。

| スキル（搭乗時） | 扱い |
|---|---|
| Q（Beartrap on a Rope） | physical。Meraki 値をそのまま使用 |
| W（Violent Tendencies） | physical。4 回連続 AA の追加ダメージ。Meraki が1ヒットあたりの値を返す |
| E（Jousting） | physical。Meraki 値をそのまま使用 |
| R（Chaaaaarge!!!） | physical。Meraki 値をそのまま使用 |

| スキル（落馬時） | 扱い |
|---|---|
| Q（Pocket Pistol） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Meraki スロット割り当て | 搭乗・落馬の2形態のスキルが Q/W/E/R にどう割り当てられているかを確認すること |
| W ダメージ値 | W は4発の AA 強化（4発目は 3 倍ボーナス）。Meraki が通常ヒット分か4発目込みかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Skaarl the Cowardly Lizard） | スカールの体力システム・再搭乗ゲージ。ダメージ出力に影響なし |
