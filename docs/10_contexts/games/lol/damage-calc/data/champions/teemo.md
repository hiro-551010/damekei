# Teemo（ティーモ）champion-passives.json

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Blinding Dart | magic | 盲目ダメージ |
| W | Move Quick | physical | 加速（ダメージなし） |
| E | Toxic Shot | magic | オンヒット毒（1秒あたり） |
| R | Noxious Trap | magic | キノコ毒ダメージ |

## 要確認

- W（Move Quick）: ダメージなしのスキルにphysicalが割り当てられているか確認

## 既知の制限

- E（Toxic Shot）はオンヒット毒のため、通常AAのダメージとは別枠で発生するが、現モデルではスキルスロットの値として表示される
