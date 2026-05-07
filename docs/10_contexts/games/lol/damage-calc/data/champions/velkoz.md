# Vel'Koz（ヴェル＝コズ）champion-passives.json

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Plasma Fission | magic | 分裂ボルト |
| W | Void Rift | magic | 裂け目ライン |
| E | Tectonic Disruption | magic | 範囲スタン |
| R | Life Form Disintegration Ray | physical | 研究ビーム（真ダメージ） |

## 要確認

- R（Life Form Disintegration Ray）: 真ダメージを与えるスキルにphysicalが割り当てられている可能性がある。MerakiのdamageTypeを確認

## 既知の制限

- パッシブ（Organic Deconstruction）の3スタック解体真ダメージは現モデルで表現不可
- R の真ダメージ変換条件はモデルに反映されない
