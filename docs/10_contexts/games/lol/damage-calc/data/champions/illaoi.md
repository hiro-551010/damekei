# Illaoi（イラオイ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Tentacle Smash） | physical。Meraki 値をそのまま使用 |
| W（Harsh Lesson） | physical。AA を強化し触手追加スラムも発生。Meraki が強化 AA ダメージ値を返す |
| E（Test of Spirit） | magic。魂引き出し時のダメージを Meraki が返す |
| R（Leap of Faith） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W は AA 強化 + 触手スラムの複合。Meraki が AA 追加ダメージのみを返すか、触手スラム分を含むかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Prophet of an Elder God）触手ダメージ | 触手が自律的に攻撃する physical ダメージは召喚物由来のため計算機では対応しない |
