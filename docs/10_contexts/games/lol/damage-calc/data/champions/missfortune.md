# Miss Fortune（ミス・フォーチュン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Double Up） | physical。Meraki が初弾または跳弾のダメージ値を返す |
| W（Strut） | ダメージなし（移動速度増加）。preMitigation = 0 で問題なし |
| E（Make It Rain） | magic。Meraki 値をそのまま使用 |
| R（Bullet Time） | physical。Meraki が1波あたりのダメージ値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q は初弾 → 跳弾の2ヒット構成で跳弾がより高ダメージ。Meraki がどちらを返すかを確認すること |
| R ダメージ値 | R は複数波を連射する。Meraki が1波あたりか合計かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Love Tap） | 直前と異なるターゲットを AA するとボーナス physical ダメージ。ターゲット切り替え条件のため計算機では対応しない |
