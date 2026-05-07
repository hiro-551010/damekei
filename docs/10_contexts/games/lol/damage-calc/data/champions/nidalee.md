# Nidalee（ニダリー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

Nidalee はヒューマン形態とクーガー形態を切り替えて使用する。

| スキル（ヒューマン形態） | 扱い |
|---|---|
| Q（Javelin Toss） | magic。Meraki が基礎ダメージ値を返す |
| W（Bushwhack） | magic。トラップのダメージを Meraki が返す |
| E（Primal Surge） | ダメージなし（ヒール + AS 増加）。preMitigation = 0 で問題なし |

| スキル（クーガー形態） | 扱い |
|---|---|
| Q（Takedown） | physical。Meraki が基礎ダメージ値を返す |
| W（Pounce） | physical。Meraki 値をそのまま使用 |
| E（Swipe） | physical。Meraki 値をそのまま使用 |
| R（Aspect of the Cougar） | ダメージなし（形態切り替え）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Meraki スロット割り当て | 2 形態のスキルが Q/W/E/R どのスロットに割り当てられているかを確認すること |
| ヒューマン Q 距離ボーナス | Javelin Toss は射程が長いほどダメージが最大 250% に増加する。Meraki が基礎値のみかを確認すること |
| クーガー Q 残 HP スケーリング | Takedown はターゲットの残 HP が低いほどダメージが増加する。Meraki が基礎値のみかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| ヒューマン Q 距離ボーナス | 可変スケーリングのため計算機では基礎値のみ表示 |
| クーガー Q 残 HP ボーナス | 可変スケーリングのため計算機では基礎値のみ表示 |
