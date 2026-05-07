# Camille（カミール）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Precision Protocol） | physical。Meraki が Q1 の物理ダメージ値を返す |
| W（Tactical Sweep） | physical。Meraki が外縁・内側の合計またはいずれかを返す |
| E（Hookshot） | magic。壁ヒット時のダメージを Meraki が返す |
| R（The Hextech Ultimatum） | ダメージなし（隔離フィールド展開）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Adaptive Defenses） | 最後に攻撃した対象タイプに応じた耐性バリア。ダメージ出力に影響なし |
| Q2 真ダメージ | 再キャスト時に追加される 50% tAD 真ダメージは Q1 物理ダメージに対して固定比率でないため skillVariant で表現不可 |
| W 外縁 最大HP% 真ダメージ | 外縁ヒット時の最大 HP 割合真ダメージは可変のため計算機では対応しない |
