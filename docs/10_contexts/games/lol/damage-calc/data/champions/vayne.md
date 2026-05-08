# Vayne（ヴェイン）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Vayne": {
    "skillOverrides": {
      "W": {
        "name": "Silver Bolts（3ヒット目）",
        "damageType": "true",
        "damageFormula": {
          "kind": "mul",
          "operands": [
            { "kind": "stat", "ref": "defender.maxHp" },
            { "kind": "byRank", "values": [0.06, 0.07, 0.08, 0.09, 0.10] }
          ]
        }
      }
    }
  }
}
```

## 各フィールドの根拠

- W（Silver Bolts）: 3ヒット目に防御側最大HPの 6/7/8/9/10% の真ダメージ。  
  LoL Wiki 確認値（最小ダメージ 50/65/80/95/110 はモンスター上限・最小値保証として別途存在するが、チャンピオン戦では実質 HP% 計算が支配的）。  
  Meraki は最小ダメージ値（50/65/80/95/110）を `baseDamageByRank` として返しているが、`damageFormula` で HP% 計算を上書きする。

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Tumble | physical | ロールAAリセット |
| W | Silver Bolts | true | 3ヒット目 防御側最大HP 6/7/8/9/10% 真ダメージ |
| E | Condemn | physical | ノックバック |
| R | Final Hour | physical | ステルスバフ（ダメージなし） |

## 要確認

- R（Final Hour）: ダメージなしのスキルにphysicalが割り当てられているか確認
