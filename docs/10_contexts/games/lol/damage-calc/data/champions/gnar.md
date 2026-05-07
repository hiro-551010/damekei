# Gnar（グナー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

Gnar はミニ形態とメガ形態を切り替えて使用する。Meraki がどちらの形態をどのスロットに割り当てるかが不明。

| スキル（ミニ形態） | 扱い |
|---|---|
| Q（Boomerang Throw） | physical。往路・復路の合計または片道を Meraki が返す |
| W（Hyper） | magic（3 スタック目の AA 追加ダメージ）。条件付きパッシブのため対象外 |
| E（Hop） | physical。着地時のダメージを Meraki が返す |

| スキル（メガ形態） | 扱い |
|---|---|
| Q（Boulder Toss） | physical。投擲ダメージを Meraki が返す |
| W（Wallop） | physical。Meraki 値をそのまま使用 |
| E（Crunch） | magic。Meraki 値をそのまま使用 |
| R（GNAR!） | magic + physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Meraki スロット割り当て | ミニ形態 Q/W/E とメガ形態 Q/W/E が同一スロットに存在する。Meraki がどちらを Q/W/E/R として返すかを確認すること |
| ミニ Q ダメージ値 | 往路・復路の2ヒット。Meraki が合計か1ヒットあたりかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| ミニ W（Hyper） | 3 スタック目の AA に追加 magic ダメージ。条件付き周期発動のため計算機では対応しない |
