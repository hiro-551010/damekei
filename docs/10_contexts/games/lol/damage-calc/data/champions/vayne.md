# Vayne

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Tumble | physical | ロールAAリセット |
| W | Silver Bolts | true | 3ヒット目真ダメージ（最大HP%） |
| E | Condemn | physical | ノックバック |
| R | Final Hour | physical | ステルスバフ（ダメージなし） |

## 要確認

- R（Final Hour）: ダメージなしのスキルにphysicalが割り当てられているか確認

## 既知の制限

- W（Silver Bolts）は3ヒット目に最大HP%真ダメージを与えるオンヒット型。Merakiの数値は%値のみで、本来の最大HP計算はモデルで再現できない
- W のHPパーセントダメージは現在のスキルモデル（baseDmg + ratio * stat）では表現不可
