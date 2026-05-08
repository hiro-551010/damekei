# Viego（ヴィエゴ）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Viego": {
    "skillOverrides": {
      "Q": {
        "name": "Blade of the Ruined King（パッシブ on-hit）",
        "damageType": "physical",
        "damageFormula": {
          "kind": "mul",
          "operands": [
            { "kind": "stat", "ref": "defender.currentHp" },
            { "kind": "byRank", "values": [0.02, 0.03, 0.04, 0.05, 0.06] }
          ]
        }
      }
    }
  }
}
```

## 各フィールドの根拠

- Q（Blade of the Ruined King）パッシブ on-hit: AA ごとに防御側現在 HP の 2/3/4/5/6% 物理ダメージを追加。  
  LoL Wiki 確認値。  
  Meraki の Q データは アクティブの多段スラッシュ（30/60/90/120/150 + totalAD 1.4 相当）を返しているが、  
  `skillOverrides.Q` で on-hit パッシブの現在 HP% formula に上書きする。  
  アクティブダメージはモデルから省略し、実戦での主要ダメージ源である on-hit を優先する。

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Blade of the Ruined King | physical | skillOverrides: 防御側現在HP 2/3/4/5/6% on-hit 物理ダメージ |
| W | Spectral Maw | magic | チャージスタン |
| E | Harrowed Path | physical | 壁沿い移動（ダメージなし） |
| R | Heartbreaker | physical | ポップ攻撃 |

## 要確認

- E（Harrowed Path）: ダメージなしのスキルにphysicalが割り当てられているか確認

## 既知の制限

- Q のアクティブダメージ（25/40/55/70/85 +60% AD）は skillOverrides で on-hit に上書きするため省略
- パッシブ（Sovereign's Domination）による敵ユニット憑依はモデル対象外
