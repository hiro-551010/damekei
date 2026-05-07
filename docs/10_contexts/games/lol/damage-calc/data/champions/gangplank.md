# Gangplank（ガングプランク）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Parrrley） | physical。クリット可能。Meraki 値をそのまま使用 |
| W（Remove Scurvy） | ダメージなし（デバフ解除・回復）。preMitigation = 0 で問題なし |
| E（Powder Keg） | physical。樽の爆発ダメージを Meraki が返す |
| R（Cannon Barrage） | physical。1 発あたりの着弾ダメージを Meraki が返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | 樽は連鎖爆発するが、Meraki が1樽ぶんのダメージのみ返すかチェーン合算かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Trial by Fire） | 約 15 秒ごとに AA が強化されて physical ダメージを与える。条件付き周期発動のため計算機では対応しない |
