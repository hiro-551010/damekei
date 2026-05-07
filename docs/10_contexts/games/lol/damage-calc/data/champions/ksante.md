# K'Sante（ケイサンテ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

通常形態と All Out 形態（R 発動後）でスキル挙動が変化する。

| スキル（通常形態） | 扱い |
|---|---|
| Q（Ntofo Strikes） | physical。Meraki 値をそのまま使用 |
| W（Path Maker） | physical。チャージ後の突進ダメージを Meraki が返す |
| E（Footwork） | physical。Meraki 値をそのまま使用 |
| R（All Out） | physical。Meraki が R 起動時のダメージ値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W はチャージ時間に応じてダメージが増加する。Meraki が最大チャージ時か最小時かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Dauntless Instinct） | スキル使用後の次 AA に追加 physical ダメージ。条件付き発動のため計算機では対応しない |
| R（All Out）形態でのスキル変化 | R 発動後は Q/W/E が変化し一部が true ダメージに変わるが、形態変化としての個別対応が必要なため対応しない |
