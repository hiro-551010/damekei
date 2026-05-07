# Briar（ブライアー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Head Rush） | physical。Meraki 値をそのまま使用 |
| W（Blood Frenzy / Snack Attack） | physical。Meraki が返す値は Snack Attack（血気発動時の強化 AA ボーナス）のフラット部分 |
| E（Chilling Scream） | physical。チャージ解放時のダメージ値を Meraki が返す |
| R（Certain Death） | physical。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Crimson Curse） | 与ダメージ時のヒール。ダメージ出力に影響なし |
| W Snack Attack 追加ダメージ（% 残 HP） | ターゲットの残 HP 割合に比例する追加物理ダメージは可変のため計算機では対応しない |
