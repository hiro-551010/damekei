# Twisted Fate（ツイステッドフェイト）champion-passives.json

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Wild Cards | magic | 3方向カード投擲 |
| W | Pick a Card | magic | カード選択（3種類） |
| E | Stacked Deck | magic | 強化AA |
| R | Destiny | physical | テレポート（ダメージなし） |

## 要確認

- W（Pick a Card）: Gold Card（スタン）・Blue Card（マナ回復）・Red Card（範囲スロー）の3形態があり、Merakiがどのカードのダメージ値を格納しているか不明
- R（Destiny）: ダメージなしのスキルにphysicalが割り当てられているか確認

## 既知の制限

- W カード3種の異なるダメージ/効果の切り替えは現モデルで表現不可
