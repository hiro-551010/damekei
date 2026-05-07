# Garen（ガレン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Decisive Strike） | physical。次の AA を強化するスキル。Meraki が強化 AA のダメージ値を返す |
| W（Courage） | ダメージなし（防御バフ）。preMitigation = 0 で問題なし |
| E（Judgment） | physical。スピン全ヒット合計ダメージを Meraki が返す |
| R（Demacian Justice） | true。Meraki が基礎真ダメージ値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | スピンは複数ヒット（持続時間依存）。Meraki が合計値か1スピンあたりかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Perseverance） | HP 自動回復。ダメージ出力に影響なし |
| R ヴィラン追加ダメージ | 対象が「ヴィラン」の場合の残 HP% 追加真ダメージは条件依存のため対応しない |
