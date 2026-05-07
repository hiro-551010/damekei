# Amumu（アムム）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Amumu": {
    "skillOverrides": {
      "W": {
        "name": "デスペア",
        "damageType": "magic",
        "baseDamageByRank": [10, 15, 20, 25, 30],
        "totalAdRatioByRank": [0, 0, 0, 0, 0],
        "bonusAdRatioByRank": [0, 0, 0, 0, 0],
        "apRatioByRank": [0, 0, 0, 0, 0]
      },
      "E": {
        "name": "タントラム",
        "damageType": "magic",
        "baseDamageByRank": [75, 100, 125, 150, 175],
        "totalAdRatioByRank": [0, 0, 0, 0, 0],
        "bonusAdRatioByRank": [0, 0, 0, 0, 0],
        "apRatioByRank": [0, 0, 0, 0, 0]
      }
    }
  }
}
```

## 各フィールドの根拠

### skillOverrides.W（Despair）

Meraki が返す値 [5, 5, 5, 5, 5] はスキルの armor reduction パッシブ値であり、実際のダメージではない。
実際のダメージ: 10/15/20/25/30 magic/s（+ 最大 HP の 1% per 100 AP）。

> HP% 部分（1% per 100 AP / s）は現在未対応。フラット部分のみ表示。

### skillOverrides.E（Tantrum）

Meraki が返す値 [5, 7, 9, 11, 13] はパッシブの物理ダメージ軽減値であり、アクティブのダメージではない。
実際の active ダメージ: 75/100/125/150/175 magic（スケーリングなし）。数値の正本は LoL Wiki「Amumu」より。

### 対象外

| 項目 | 理由 |
|---|---|
| Q（Bandage Toss） | Meraki 値は正しい |
| R（Curse of the Sad Mummy） | Meraki 値は正しい |
| Passive（Cursed Touch） | MR 減少バフ。ダメージ出力に直接影響しないため対象外 |
