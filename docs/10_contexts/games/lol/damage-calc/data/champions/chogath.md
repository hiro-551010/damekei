# Cho'Gath（チョ＝ガス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Rupture） | magic。Meraki 値をそのまま使用 |
| W（Feral Scream） | magic。Meraki 値をそのまま使用 |
| E（Vorpal Spikes） | physical。AA ごとに付与されるオンヒット追加ダメージ（トグル）。Meraki がランク別の1ヒットあたりの値を返す |
| R（Feast） | true。Meraki が基礎ダメージ値を返す。Carnivore スタックによる最大 HP 増加分は除外 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | E はトグルによる AA オンヒット追加ダメージ。Meraki がスキルキャスト値ではなく1ヒットあたりの on-hit 値を正しく返しているか確認すること |
| R ダメージ値 | Carnivore パッシブによるスタック（Feast でキルするたびに最大 HP 増加）は Meraki の基礎値に含まれないはず。確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Carnivore） | キル時のヒール・最大HP増加。R の基礎ダメージには影響しない |
| R スタックボーナスダメージ | Feast キル回数による R の追加ダメージはスタック依存のため計算機では対応しない |
