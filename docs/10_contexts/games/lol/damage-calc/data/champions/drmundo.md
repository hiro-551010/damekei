# Dr. Mundo（ドクター・ムンド）champion-passives.json

## champion-passives.json エントリ

```json
{
  "DrMundo": {
    "skillOverrides": {
      "Q": {
        "name": "Infected Bonesaw",
        "damageType": "magic",
        "damageFormula": {
          "kind": "mul",
          "operands": [
            { "kind": "stat", "ref": "defender.currentHp" },
            { "kind": "byRank", "values": [0.20, 0.225, 0.25, 0.275, 0.30] }
          ]
        }
      }
    }
  }
}
```

## 各フィールドの根拠

- Q（Infected Bonesaw）: 防御側現在 HP の 20/22.5/25/27.5/30% 魔法ダメージ（最小 80/130/180/230/280）。  
  LoL Wiki 確認値。Meraki は最小ダメージ値（80/130/180/230/280）を `baseDamageByRank` として返している。  
  チャンピオン戦では現在 HP% 計算が支配的なため、`skillOverrides.Q` で formula を上書きする。  
  最小ダメージ保証（clamp ノード）は実装を複雑化させるため省略する。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Infected Bonesaw） | magic。skillOverrides: 防御側現在HP 20/22.5/25/27.5/30% 魔法ダメージ |
| W（Heart Zapper） | magic。Meraki 値をそのまま使用 |
| E（Blunt Force Trauma） | physical。Meraki 値をそのまま使用 |
| R（Maximum Dosage） | ダメージなし（自己バフ・回復）。preMitigation = 0 で問題なし |

## 既知の制限

- Q の最小ダメージ保証（80/130/180/230/280）は clamp ノード未対応のため反映されない

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Goes Where He Pleases） | テナシティ強化・Grievous Wounds 免疫。ダメージ出力に影響なし |
| R 変身中ダメージ増加 | R 中の最大 HP・AD 増加はバフ依存のため計算機では対応しない |
