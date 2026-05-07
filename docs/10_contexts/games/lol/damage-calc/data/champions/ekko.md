# Ekko（エコー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Timewinder） | magic。往路・復路の各1ヒット分を Meraki が返す |
| W（Parallel Convergence） | magic。爆発時のダメージを Meraki が返す |
| E（Phase Dive） | magic。ダッシュ後の強化 AA ダメージを Meraki が返す |
| R（Chronobreak） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q は往路と復路で同じターゲットに2ヒットする。Meraki が往復合計値（2ヒット分）を返すか1ヒットあたりの値を返すかを確認すること。合計値の場合は片道ダメージが過大表示になる |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Z-Drive Resonance） | 同一ターゲットへの3ヒット目に追加魔法ダメージ。条件付き周期発動のため計算機では対応しない |
