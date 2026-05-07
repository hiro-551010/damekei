# Olaf（オラフ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Undertow） | physical。Meraki 値をそのまま使用 |
| W（Vicious Strikes） | ダメージなし（AS・ライフスティール増加）。preMitigation = 0 で問題なし |
| E（Reckless Swing） | true。Meraki 値をそのまま使用 |
| R（Ragnarok） | ダメージなし（CC 免疫 + ボーナス AD）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Berserker Rage） | HP が低いほど AS が増加。ダメージ倍率への直接影響なし |
| R ボーナス AD（20/30/40） | R アクティブ中のフラットボーナス AD は stateModifier で表現可能だが、現行の `bonusAdFromBaseAd` kind では基礎 AD 比率しか表現できない。新規 kind（`flatBonusAd`）の追加が必要 |
