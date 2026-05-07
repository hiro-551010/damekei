# Quinn（クイン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Blinding Assault） | physical。Meraki 値をそのまま使用 |
| W（Heightened Senses） | ダメージなし（パッシブ視界範囲増加）。preMitigation = 0 で問題なし |
| E（Vault） | physical。Meraki 値をそのまま使用 |
| R（Behind Enemy Lines / Skystrike） | physical。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Harrier） | Valor がランダムに敵をマーク。次の AA でボーナス physical ダメージ。条件付き発動のため計算機では対応しない |
