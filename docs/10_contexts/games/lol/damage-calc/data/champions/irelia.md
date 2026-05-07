# Irelia（イレリア）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Bladesurge） | physical。Meraki 値をそのまま使用 |
| W（Defiant Dance） | physical。チャージを解放した時のダメージを Meraki が返す |
| E（Flawless Duet） | magic。Meraki 値をそのまま使用 |
| R（Vanguard's Edge） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W はチャージ時間に応じてダメージが増加する。Meraki が最大チャージ時か最小チャージ時かのどちらを返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Ionian Fervor） | 複数チャンピオンへのヒットでスタックする AS・ボーナス AD バフ。スタック条件依存のため計算機では対応しない |
