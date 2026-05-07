# LeBlanc（ルブラン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Sigil of Malice） | magic。Meraki が初弾ダメージ値を返す |
| W（Distortion） | magic。Meraki 値をそのまま使用 |
| E（Ethereal Chains） | magic。Meraki 値をそのまま使用 |
| R（Mimic） | magic。Meraki が R のダメージ値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はヒット直後に他スキルを当てると爆発して追加ダメージ。Meraki が初弾のみか爆発込みかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Sigil of Malice）爆発ダメージ | Q / R（Q コピー）のマーク爆発は他スキルとの連携が前提のため計算機では対応しない |
| R（Mimic）の実ダメージ | R は最後に使用したスキルをコピーするため効果が可変。計算機では R 自体の固有値のみ表示 |
