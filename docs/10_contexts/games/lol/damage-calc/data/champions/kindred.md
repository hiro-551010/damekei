# Kindred（キンドレッド）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Dance of Arrows） | physical。Meraki 値をそのまま使用 |
| W（Wolf's Frenzy） | physical。Wolf の AA ダメージを Meraki が返す |
| E（Mounting Dread） | physical。Meraki 値をそのまま使用 |
| R（Lamb's Respite） | ダメージなし（無敵ゾーン）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W は Wolf が自律的に AA するスキル。Meraki が Wolf の1ヒットあたりのダメージを返しているか、または空値かを確認すること |
| E ダメージ値 | E は残 HP が少ないターゲットへの追加ダメージ（スロー × 3 スタック後）を含む。Meraki が基礎値のみを返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Mark of the Kindred） | スタックで射程・W ダメージが増加するが、スタック数依存のため計算機では対応しない |
