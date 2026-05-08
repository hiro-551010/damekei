# Kog'Maw（コグマウ）champion-passives.json

## champion-passives.json エントリ

```json
{
  "KogMaw": {
    "skillOverrides": {
      "W": {
        "name": "Bio-Arcane Barrage（オンヒット）",
        "damageType": "magic",
        "damageFormula": {
          "kind": "add",
          "operands": [
            {
              "kind": "mul",
              "operands": [
                { "kind": "stat", "ref": "defender.maxHp" },
                { "kind": "byRank", "values": [0.03, 0.0375, 0.045, 0.0525, 0.06] }
              ]
            },
            {
              "kind": "mul",
              "operands": [
                { "kind": "stat", "ref": "attacker.ap" },
                { "kind": "const", "value": 0.015 }
              ]
            }
          ]
        }
      }
    }
  }
}
```

## 各フィールドの根拠

- W（Bio-Arcane Barrage）: トグル中の AA に防御側最大HP の 3/3.75/4.5/5.25/6% + AP×1.5% の魔法ダメージを追加。  
  LoL Wiki 確認値。AP スケーリングは 1.5% per 100 AP = 0.015 per 1 AP。  
  Meraki は W の `baseDamageByRank` を空（`[]`）で返すため、`skillOverrides.W` で formula を完全上書きする。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Caustic Spittle） | magic。Meraki 値をそのまま使用 |
| W（Bio-Arcane Barrage） | magic。skillOverrides で 最大HP% + AP スケーリング formula を設定 |
| E（Void Ooze） | magic。Meraki 値をそのまま使用 |
| R（Living Artillery） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Icathian Surprise） | 死亡後の爆発ダメージ。自身のダメージ出力には影響しない |
