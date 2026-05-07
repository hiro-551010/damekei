# Evelynn（イブリン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Hate Spike） | magic。Meraki 値をそのまま使用 |
| W（Allure） | ダメージなし（チャーム + MR 削り）。preMitigation = 0 で問題なし |
| E（Whiplash） | magic。Allure 未適用時の基礎ダメージ値を Meraki が返す |
| R（Last Caress） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Demon Shade） | レベル 6 以降のステルス。ダメージ出力に影響なし |
| W の MR 削り効果 | Allure チャーム後に MR を最大 25% 削るが、これを magic pen として反映するには条件付きトリガーの制御が必要なため対応しない |
| E Allure 後ボーナスダメージ | チャーム適用後の E は追加魔法ダメージが加わるが、Allure との組み合わせ条件のため計算機では基礎値のみ表示 |
| R 低 HP 実行ボーナス | 体力が一定以下の敵へのダメージ増加は条件依存のため対応しない |
