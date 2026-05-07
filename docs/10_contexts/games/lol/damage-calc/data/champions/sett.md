# Sett

## champion-passives.json エントリ

```json
"Sett": {
  "skillVariants": {
    "W": [
      {
        "name": "W（中心ヒット・真ダメージ）",
        "multiplier": 1.0,
        "damageType": "true"
      }
    ]
  }
}
```

## 各フィールドの根拠

- W "Haymaker": 外側エリアは物理ダメージ、中心エリアへのヒットは同量の真ダメージ。  
  `multiplier: 1.0`（ダメージ量は外側と同値）、`damageType: "true"`。

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Knuckle Down | physical | 強化AA2発 |
| W | Haymaker | physical | Grit放出・外側物理ダメージ。中心バリアントあり |
| E | Facebreaker | physical | 引き寄せスラム |
| R | The Show Stopper | physical | ボディスラム |

## 既知の制限

- W のダメージはGrit（吸収したダメージ量）に依存するため、Merakiの固定値はGrit蓄積量を前提とした参考値に過ぎない
