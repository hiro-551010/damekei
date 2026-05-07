# Talon（タロン）champion-passives.json

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Noxian Diplomacy | physical | AA強化出血付き |
| W | Rake | physical | 鎖投擲往復 |
| E | Assassin's Path | physical | 壁越えダッシュ（ダメージなし） |
| R | Shadow Assault | physical | 刃飛散/収束 |

## 要確認

- E（Assassin's Path）: ダメージなしのスキルにphysicalが割り当てられているか確認
- W（Rake）: 往路と復路でダメージが異なる可能性。Merakiがどちらを格納しているか不明

## 既知の制限

- パッシブ（Blade's End）の3スタック出血ダメージは現モデルで表現不可
