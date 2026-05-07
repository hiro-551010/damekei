# Pyke（パイク）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Bone Skewer） | physical。タップ（刺し）またはホールド（引き込み）で使用。Meraki が基礎ダメージ値を返す |
| W（Ghostwater Dive） | ダメージなし（ステルス + 移動速度増加）。preMitigation = 0 で問題なし |
| E（Phantom Undertow） | physical。Meraki 値をそのまま使用 |
| R（Death from Below） | true。Meraki が基礎真ダメージ値を返す |

## 既知の制限

| 項目 | 内容 |
|---|---|
| R 実行閾値ボーナスダメージ | R はターゲットの HP が一定以下の場合に確定キルするが、実行判定・ボーナスダメージは HP 依存のため計算機では基礎値のみ表示 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Gift of the Drowned Ones） | 戦闘外でのグレー HP 回収。ダメージ出力に影響なし |
