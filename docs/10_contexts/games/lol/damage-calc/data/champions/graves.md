# Graves（グレイブス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（End of the Line） | physical。Meraki が着弾ダメージ値を返す |
| W（Smoke Screen） | ダメージなし（視界制限）。preMitigation = 0 で問題なし |
| E（Quickdraw） | physical。ダッシュ中のダメージを Meraki が返す |
| R（Collateral Damage） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q は着弾時ダメージと後方爆発の2段階。Meraki が合計か着弾のみかを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| AA ショットガン仕様 | Graves の AA はペレット8発を広域に発射する特殊仕様（近距離ほど多くヒット）。計算機の AA 行は単体命中の標準値として扱う |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（New Destiny） | ショットガン弾薬・装填システム。ダメージ倍率への直接影響なし（上記「既知の制限」として記録） |
