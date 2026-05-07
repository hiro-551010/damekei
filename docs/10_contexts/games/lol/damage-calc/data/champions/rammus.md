# Rammus（ラムス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Powerball） | magic。Meraki 値をそのまま使用 |
| W（Defensive Ball Curl） | physical。W アクティブ中の AA 反射ダメージを Meraki が返す |
| E（Frenzying Taunt） | ダメージなし（挑発）。preMitigation = 0 で問題なし |
| R（Soaring Slam） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W は受けたダメージの一部を反射する仕組みのため、Meraki がどのような値を返すかが不明。固定値か比率かを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| Passive（Spiked Shell）ボーナス AD | パッシブでアーマー値の一部がボーナス AD に変換されるが、これはアーマーから動的に計算される値。現行モデルではアイテムや成長値から算出するアーマーと AD は独立して扱われるためこの変換は反映されない |
