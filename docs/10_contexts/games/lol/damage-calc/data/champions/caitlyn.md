# Caitlyn（ケイトリン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Piltover Peacemaker） | physical。Meraki 値をそのまま使用 |
| W（Yordle Snap Trap） | physical。設置トラップのダメージ値を Meraki が返す |
| E（90 Caliber Net） | physical。Meraki 値をそのまま使用 |
| R（Ace in the Hole） | physical。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | 罠はターゲットが踏んだ時に発動するダメージ（physical）。Meraki が罠単体のダメージ値を正しく返しているか確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Headshot） | 6 回 AA ごとに 100% ボーナス物理ダメージ（罠・拘束状態の敵に対しては 200〜250%）。周期的かつ条件付き発動のため計算機では対応しない |
