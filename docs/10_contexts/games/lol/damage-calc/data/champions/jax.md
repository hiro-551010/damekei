# Jax（ジャックス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Leap Strike） | magic。Meraki 値をそのまま使用 |
| W（Empower） | magic。次の AA または Q に乗せる追加ダメージを Meraki が返す |
| E（Counter Strike） | physical。回避後の爆発ダメージを Meraki が返す |
| R（Grandmaster's Might） | magic。アクティブ使用時のダメージ値を Meraki が返す |

## 対象外

| 項目 | 理由 |
|---|---|
| R パッシブ（3 回目 AA 追加魔法ダメージ） | 3 回 AA ごとに追加 magic ダメージ。条件付き周期発動のため計算機では対応しない |
