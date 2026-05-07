# Kayn（ケイン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

通常形態・Rhaast 形態（赤）・Shadow Assassin 形態（青）でスキル挙動が変化する。

| スキル（共通） | 扱い |
|---|---|
| Q（Reaping Slash） | physical。Meraki が通常形態の値を返す |
| W（Blade's Reach） | physical。Meraki 値をそのまま使用 |
| E（Shadow Step） | physical。Meraki 値をそのまま使用 |
| R（Umbral Trespass） | physical（Rhaast）または magic（Shadow Assassin）。Meraki がどちらかの形態の値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| R ダメージタイプ | R のダメージタイプは Rhaast（physical）と Shadow Assassin（magic）で異なる。Meraki がどちらの形態の値と damageType を返すかを確認すること |
| Q/W/E ダメージ値 | Rhaast / Shadow Assassin それぞれで同スキルのダメージ倍率が変化する場合がある。Meraki がどの形態の値を返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（The Darkin Scythe） | Rhaast 形態での吸収・Shadow Assassin 形態でのミラーイメージ。ダメージ出力の直接変化は形態依存のため対応しない |
| Rhaast R 最大 HP% ダメージ | Rhaast の R は最大 HP% のボーナスダメージを含むが可変のため対応しない |
