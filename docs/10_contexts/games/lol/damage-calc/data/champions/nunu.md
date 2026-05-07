# Nunu & Willump（ヌヌ＆ウィルンプ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Consume） | magic。Meraki 値をそのまま使用 |
| W（Biggest Snowball Ever!） | magic。雪玉が大きくなった際のダメージを Meraki が返す |
| E（Snowball Barrage） | magic。Meraki が1スノーボールあたりのダメージ値を返す |
| R（Absolute Zero） | magic。チャネル全体のダメージ合計を Meraki が返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | E は複数のスノーボールを投げる。Meraki が1発あたりか合計かを確認すること |
| R ダメージ値 | R はチャネルが完了するほど高ダメージ。Meraki が最大チャネル時の値かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Call of the Freljord） | スキル使用後の次 2 回 AA に追加 magic ダメージ。条件付き発動のため計算機では対応しない |
