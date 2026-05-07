# Kayle（ケール）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Radiant Blast） | magic。Meraki 値をそのまま使用 |
| W（Celestial Blessing） | ダメージなし（ヒール + 移動速度増加）。preMitigation = 0 で問題なし |
| E（Starfire Spellblade） | magic。パッシブ on-hit magic ダメージ。アクティブ時の追加ダメージ値を Meraki が返す |
| R（Divine Judgment） | magic。AoE magic ダメージ値を Meraki が返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | E はパッシブ（AA ごとに on-hit magic）とアクティブ（次の AA を強化）を持つ。Meraki がアクティブ分のみを返すか、パッシブ on-hit 値を含むかを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| AA 進化（Divine Ascent） | Kayle は Lv6/11/16 で AA が強化されレンジ化・炎トレイルダメージが追加されるが、レベル別の AA タイプ変化はスキルモデルで表現できない |
| E パッシブ on-hit magic | E パッシブは AA ごとに魔法ダメージ（AP スケーリング）を与えるが、`passiveSpec` は現在 `onHitMaxHpPercent` のみ対応のため表現できない |
