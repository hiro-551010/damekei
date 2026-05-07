# Morgana（モルガナ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Dark Binding） | magic。Meraki 値をそのまま使用 |
| W（Tormented Shadow） | magic。Meraki が DoT の合計ダメージ値を返す |
| E（Black Shield） | ダメージなし（魔法シールド）。preMitigation = 0 で問題なし |
| R（Soul Shackles） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W は継続ダメージ（DoT）。Meraki が全継続合計か1秒あたりかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Soul Siphon） | スペルヴァンプ（スキルで与えたダメージをヒール）。ダメージ出力に影響なし |
