# Diana（ダイアナ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Crescent Strike） | magic。Meraki 値をそのまま使用 |
| W（Pale Cascade） | magic。Meraki が返す値を使用 |
| E（Lunar Rush） | magic。Meraki 値をそのまま使用 |
| R（Moonfall） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W は3個のオーブを展開して爆発させる。Meraki が3個合計のダメージを返すか、1オーブあたりのダメージを返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Moonsilver Blade） | 3 回 AA ごとに AoE 魔法ダメージを追加。周期的発動のため計算機では対応しない |
