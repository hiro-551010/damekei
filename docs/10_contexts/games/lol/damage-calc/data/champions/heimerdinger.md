# Heimerdinger（ハイマーディンガー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（H-28G Evolution Turret） | ダメージなし（タレット設置）。preMitigation = 0 で問題なし |
| W（Hextech Micro-Rockets） | magic。Meraki 値をそのまま使用 |
| E（CH-2 Electron Storm Grenade） | magic。Meraki 値をそのまま使用 |
| R（UPGRADE!!!） | ダメージなし（次のスキルを強化）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| タレット（H-28G / H-28Q）のダメージ | タレットが自律的に行う AA・ビームの magic ダメージは召喚物由来のため計算機では対応しない |
| R 強化スキルのボーナスダメージ | R 発動後の Q/W/E 強化版は性能が大幅に変わるが、形態変化として個別対応が必要なため対応しない |
