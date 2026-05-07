# Katarina（カタリナ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Bouncing Blade） | magic。Meraki 値をそのまま使用 |
| W（Preparation） | magic。ダガーを置くダメージを Meraki が返す（着地 damage あり） |
| E（Shunpo） | magic。ダッシュ先のダメージを Meraki が返す |
| R（Death Lotus） | magic。1本のダガーあたりのダメージを Meraki が返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| R ダメージ値 | R は複数本のダガーを投げ続ける。Meraki が1本あたりか合計かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Voracity） | ダガーを拾うと近くの敵に magic ダメージ + リセットを得る。ダガーバウンス発動条件のため計算機では対応しない |
