# Akshan（アクシャン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Avengerang） | physical。往路・復路の合計値（1.6 tAD）を Meraki が返している。合計表示として正しい |
| W（Going Rogue） | ダメージなし（透明化・マーク付与）。空値のため preMitigation = 0 で問題なし |
| E（Heroic Swing） | physical。1 ティック分の値のみ。スウィング中の合計ダメージは状況依存のため許容 |
| R（Comeuppance） | physical。全弾の合計値を Meraki が返している |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Dirty Fighting） | 2 回目の AA ごとに魔法追加ダメージを付与するリコシェット。毎 2 ヒットという条件付き発動のため計算機では対応しない |
