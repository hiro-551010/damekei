# Gwen（グウェン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Snip Snip!） | magic。Meraki が基礎切りつけダメージ値を返す |
| W（Hallowed Mist） | ダメージなし（防護ゾーン展開）。preMitigation = 0 で問題なし |
| E（Skip 'n Slash） | magic。ダッシュ後の強化 AA ダメージを Meraki が返す |
| R（Needlework） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はスタック数に応じて切りつけ回数が増加（2〜6 回）し、最後の一撃は中心ヒット時に追加ダメージ。Meraki が何回分の合計を返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Thousand Cuts） | AA ごとに AP スケーリングの最大 HP% 追加魔法ダメージを与える。`onHitMaxHpPercent` の kind は存在するが Gwen のパッシブは AP 比率（0.01% per AP）ベースで percentByLevel 配列では表現できないため対応しない |
