# Elise（エリス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

Elise はヒューマン形態とスパイダー形態を切り替えて使用する。Meraki は各形態のスキルをどのスロットに割り当てるかが不明。

| スキル（ヒューマン形態） | 扱い |
|---|---|
| Q（Neurotoxin） | magic。現在 HP% ダメージを含む（要確認） |
| W（Volatile Spiderling） | magic。Meraki 値をそのまま使用 |
| E（Cocoon） | ダメージなし（CC）。preMitigation = 0 で問題なし |

| スキル（スパイダー形態） | 扱い |
|---|---|
| Q（Venomous Bite） | magic。残 HP% ダメージを含む（要確認） |
| W（Skittering Frenzy） | ダメージなし（AS 増加）。preMitigation = 0 で問題なし |
| E（Rappel） | ダメージなし（移動）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Meraki スロット割り当て | 2 形態 × 3 スキルのデータが Q/W/E/R 4 スロットにどう割り当てられているかを確認すること |
| ヒューマン Q ダメージ値 | Neurotoxin は固定値 + 現在 HP の 2〜4% magic ダメージ。HP% 部分を Meraki が正しくモデル化しているか確認すること |
| スパイダー Q ダメージ値 | Venomous Bite は固定値 + 残 HP の 4〜8% magic ダメージ。HP% 部分の扱いを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Spider Swarm） | スパイダー形態の召喚スパイダーリングのダメージ。個体数・状況依存のため計算機では対応しない |
| HP% スケーリング部分 | スキルモデルが baseDamage + AD/AP ratio のみのため、現在/残 HP% ダメージは正確に表現できない |
