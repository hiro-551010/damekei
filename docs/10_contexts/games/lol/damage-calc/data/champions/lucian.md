# Lucian（ルシアン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Piercing Light） | physical。Meraki 値をそのまま使用 |
| W（Ardent Blaze） | magic。Meraki 値をそのまま使用 |
| E（Relentless Pursuit） | ダメージなし（ダッシュ）。preMitigation = 0 で問題なし |
| R（The Culling） | physical。Meraki が1ショットあたりのダメージ値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| R ダメージ値 | R は多数のショットを連射する。Meraki が1発あたりか合計かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Lightslinger） | スキル使用後に 2 発の AA を追加発射。ダメージはスキルではなく AA として計算されるため計算機では対応しない |
