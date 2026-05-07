# Fizz（フィズ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Urchin Strike） | magic。Meraki 値をそのまま使用 |
| W（Seastone Trident） | magic。W アクティブ中の AA 追加ダメージ（1ヒットあたり）を Meraki が返す |
| E（Playful/Trickster） | magic。Meraki 値をそのまま使用 |
| R（Chum the Waters） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q は物理 AA ダメージ + 魔法ダメージの複合。Meraki がどちらか一方のみ返すか合算するかを確認すること |
| W ダメージ値 | W アクティブは 3 回の AA に追加魔法ダメージを乗せる。Meraki が1ヒットあたりの値か合計（3 ヒット分）かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Nimble Fighter） | 受ける AA ダメージ軽減。自身のダメージ出力に影響なし |
