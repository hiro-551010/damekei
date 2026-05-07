# Ryze

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Overload | magic | ルーン充填ボルト |
| W | Rune Prison | magic | ルートダメージ |
| E | Spell Flux | magic | バウンスダメージ |
| R | Realm Warp | physical | テレポート（ダメージなし） |

## 要確認

- R（Realm Warp）: ダメージなしのスキルにphysicalが割り当てられているか確認

## 既知の制限

- パッシブ（Arcane Mastery）によるAP比率増加はモデルに反映されない
- Q のパッシブ充填状態（Overload charged）の追加ダメージバリアントは非対象
- E のバウンス回数による多段ヒットは単一ヒット値として表示される
