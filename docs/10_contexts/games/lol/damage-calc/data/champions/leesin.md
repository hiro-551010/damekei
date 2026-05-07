# Lee Sin（リー・シン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Sonic Wave / Resonating Strike） | physical。Meraki が Q1（ソニックウェーブ）のダメージ値を返す |
| W（Safeguard / Iron Will） | ダメージなし（シールド・ライフスティール強化）。preMitigation = 0 で問題なし |
| E（Tempest / Cripple） | magic。Meraki 値をそのまま使用 |
| R（Dragon's Rage） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q は2段階（Q1 ソニックウェーブ → Q2 追尾突進）。Meraki が Q1 のみか Q1+Q2 合算かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Flurry） | スキル使用後の AA2 発で AS 増加・エナジー回収。ダメージ出力に影響なし |
