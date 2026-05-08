# Nasus（ナサス）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Nasus": {
    "skillOverrides": {
      "Q": {
        "name": "Siphoning Strike",
        "damageType": "physical",
        "damageFormula": {
          "kind": "add",
          "operands": [
            { "kind": "byRank", "values": [35, 55, 75, 95, 115] },
            { "kind": "stat", "ref": "attacker.stackCount" }
          ]
        }
      }
    }
  }
}
```

## 各フィールドの根拠

- Q（Siphoning Strike）: 基礎物理ダメージ（ランク別）+ スタック数×1 ダメージ。  
  LoL Wiki 確認値: 基礎 40/60/80/100/120、スタック 1 個につき +1 ダメージ（= 100% of stacks）。  
  Meraki が返す値は 35/55/75/95/115 で wiki 値より 5 少ない（おそらく Meraki 独自の丸め差異）。  
  `damageFormula` では Meraki の基礎値（35/55/75/95/115）を `byRank` として使い、`attacker.stackCount` を加算する。  
  スタック 1 個 = +1 ダメージ（stackCount 100 → +100 ダメージ）として機能する。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Siphoning Strike） | physical。skillOverrides: byRank(35/55/75/95/115) + attacker.stackCount |
| W（Wither） | ダメージなし（スロー）。preMitigation = 0 で問題なし |
| E（Spirit Fire） | magic。Meraki 値をそのまま使用 |
| R（Fury of the Sands） | magic。Meraki が R 発動時の AoE ダメージ値を返す |

## 既知の制限

| 項目 | 内容 |
|---|---|
| Q スタック増加仕様 | キルで +3（チャンピオン/大型は +12）ずつ永続増加。本システムでは入力値をスタック数として直接使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Soul Eater） | ライフスティール。ダメージ出力に影響なし |
