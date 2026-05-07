# Jayce（ジェイス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

Jayce はハンマー形態とキャノン形態を切り替えて使用する。Meraki がどちらの形態をどのスロットに割り当てるか不明。

| スキル（ハンマー形態） | 扱い |
|---|---|
| Q（To the Skies!） | physical。Meraki 値をそのまま使用 |
| W（Lightning Field） | magic。近接 AA ごとに付与する on-hit 魔法ダメージ |
| E（Thundering Blow） | physical。Meraki 値をそのまま使用 |

| スキル（キャノン形態） | 扱い |
|---|---|
| Q（Shock Blast） | physical。Meraki 値をそのまま使用 |
| W（Hyper Charge） | physical。次の 3 回の AA を強化。Meraki が強化 AA1 発あたりのダメージを返す |
| E（Acceleration Gate） | ダメージなし（移動速度バフ）。preMitigation = 0 で問題なし |
| R（Mercury Cannon / Mercury Hammer） | ダメージなし（形態切り替え）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Meraki スロット割り当て | ハンマー形態・キャノン形態の各スキルが Q/W/E/R どのスロットにどの順で割り当てられているかを確認すること |
| W（ハンマー）ダメージ値 | Lightning Field は AA ごとの on-hit magic。Meraki が1ヒットあたりか持続時間合計かを確認すること |
| W（キャノン）ダメージ値 | Hyper Charge は 3 発分の強化 AA。Meraki が1発あたりか3発合計かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Hextech Capacitor） | 形態切り替え時の移動速度・ゴースト。ダメージ出力に影響なし |
