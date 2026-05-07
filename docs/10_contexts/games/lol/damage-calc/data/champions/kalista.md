# Kalista（カリスタ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Pierce） | physical。Meraki 値をそのまま使用 |
| W（Sentinel） | physical。霊のダメージを Meraki が返す |
| E（Rend） | physical。Meraki が1スペアあたりのダメージ値を返す |
| R（Fate's Call） | ダメージなし（アライスローイング）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | E はターゲットに刺さったスペアの本数に比例してダメージが増加する。Meraki が1スペアあたりの値を返すか合計を返すかを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| Passive（Martial Poise） | Kalista の AA はすべての AA でステップ移動する独自挙動だが、ダメージ倍率には影響しない |
