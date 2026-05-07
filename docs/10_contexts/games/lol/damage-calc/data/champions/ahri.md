# Ahri（アーリ）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Ahri": {
    "skillOverrides": {
      "Q": {
        "name": "オーブ・オブ・デセプション",
        "damageType": "magic",
        "baseDamageByRank": [40, 65, 90, 115, 140],
        "totalAdRatioByRank": [0, 0, 0, 0, 0],
        "bonusAdRatioByRank": [0, 0, 0, 0, 0],
        "apRatioByRank": [0.35, 0.35, 0.35, 0.35, 0.35],
        "variants": [
          { "name": "Q（復路・真ダメージ）", "multiplier": 1.0, "damageType": "true" }
        ]
      }
    }
  }
}
```

## 各フィールドの根拠

### skillOverrides.Q（Orb of Deception）

Meraki から生成した champions.json では Ahri Q が以下の問題を持つ：
- damageType: "physical" — Q は magic/true の複合型だが、Meraki の型フィールドが MAGIC_DAMAGE / TRUE_DAMAGE のいずれでもないためスクリプトが physical にフォールバックする
- baseDamageByRank: [80, 130, 180, 230, 280] — 往路・復路の合計値になっている
- apRatioByRank: [1.0, ...] — 同様に合計値

skillOverrides で往路（magic）の値のみを正しく上書きする。数値の正本は LoL Wiki「Ahri」より。

### variants（復路・真ダメージ）

- 往路と同じ式（base + 0.35 AP）、ダメージ種別のみ true
- multiplier: 1.0 — 往路と同じ威力
- damageType: "true" — 親スキル（magic）を上書き

### 対象外

| 項目 | 理由 |
|---|---|
| Passive（Essence Theft） | HP 回復のみ。ダメージ出力に影響なし |
| W / E / R | champions.json の値で完結。追加実装不要 |
