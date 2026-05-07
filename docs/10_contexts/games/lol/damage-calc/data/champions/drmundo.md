# Dr. Mundo（ドクター・ムンド）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Infected Bonesaw） | magic。現在 HP% ベースのダメージ。Meraki が返す値の意味を要確認 |
| W（Heart Zapper） | magic。継続ダメージを Meraki が返す |
| E（Blunt Force Trauma） | physical。最大 HP 連動のボーナス AD を含んだ強化 AA のダメージ値を Meraki が返す |
| R（Maximum Dosage） | ダメージなし（自己バフ・回復）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q のダメージは「現在 HP の 20〜30%」魔法ダメージだが、Meraki の標準フォーマット（baseDamage + ratios）では HP% スケーリングを表現できない。Meraki が返す値が何を意味するか（空値・固定値・近似値）を確認すること |
| W ダメージ値 | W は継続ダメージ（duration 中に自分の最大 HP% を消費しながらダメージを与える）。Meraki が全継続合計か1秒あたりかを確認すること |
| E ダメージ値 | E パッシブは「最大 HP × 割合」のボーナス AD を付与するが、Meraki がこれを bonusAdRatio に正しく変換しているか確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Goes Where He Pleases） | テナシティ強化・Grievous Wounds 免疫。ダメージ出力に影響なし |
| R 変身中ダメージ増加 | R 中の最大 HP・AD 増加はバフ依存のため計算機では対応しない |
