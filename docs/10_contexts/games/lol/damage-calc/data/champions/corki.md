# Corki（コーキ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Phosphorus Bomb） | magic。Meraki 値をそのまま使用 |
| W（Valkyrie） | magic。通過経路の炎ダメージを Meraki が返す |
| E（Gatling Gun） | physical + magic（armor/MR 削り）。Meraki が返すダメージ値を使用 |
| R（Missile Barrage） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | Gatling Gun はトータルの物理・魔法ダメージを数ヒット分まとめて返す可能性あり。何ヒット分かを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| AA ダメージタイプ | Corki の通常 AA は 80% magic / 20% physical の混合ダメージだが、計算機は AA を純粋な physical として計算するため AA 行の結果が不正確になる。physical 全量に対して effArmor が適用され、魔法部分の MR 軽減が無視される |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Hextech Munitions） | AA の魔法ダメージ変換は上記「既知の制限」のとおり計算機では未対応 |
