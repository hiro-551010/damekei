# Naafiri（ナーフィリ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Darkin Daggers） | physical。Meraki が1ダガーあたりのダメージ値を返す |
| W（Hounds Pursuit） | physical。Meraki 値をそのまま使用 |
| E（Eviscerate） | physical。Meraki 値をそのまま使用 |
| R（The Call of the Pack） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はダガーを2本投げて重なると出血が付く。Meraki が1ダガーあたりか2本合計かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（We Are More）パックメイトダメージ | パックメイトが自律的に行う physical ダメージは召喚物由来のため計算機では対応しない |
