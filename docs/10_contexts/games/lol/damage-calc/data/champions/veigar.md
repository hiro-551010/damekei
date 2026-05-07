# Veigar

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Baleful Strike | magic | 貫通ボルト |
| W | Dark Matter | magic | 落下ダメージ |
| E | Event Horizon | physical | ケージ設置（スタン） |
| R | Primordial Burst | magic | HP差ダメージ |

## 要確認

- E（Event Horizon）: ダメージなしのスキルにphysicalが割り当てられているか確認

## 既知の制限

- パッシブ（Phenomenal Evil Power）のスタックAPはモデルに反映されない
- R のダメージは対象のHP割合（欠けているHP）に依存するためMerakiの固定値は最大ダメージ時の参考値
