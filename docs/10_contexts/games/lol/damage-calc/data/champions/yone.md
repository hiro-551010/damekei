# Yone（ヨネ）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Yone": {
    "aaCritOverride": {
      "alwaysCrit": false,
      "baseMultiplier": 1.5
    },
    "skillOverrides": {
      "W": {
        "name": "Spirit Cleave（魔法ダメージ成分）",
        "damageType": "magic",
        "damageFormula": {
          "kind": "mul",
          "operands": [
            { "kind": "stat", "ref": "defender.maxHp" },
            { "kind": "byRank", "values": [0.04, 0.045, 0.05, 0.055, 0.06] }
          ]
        }
      }
    }
  }
}
```

## 各フィールドの根拠

- パッシブ（Way of the Hunter）: クリティカルダメージが150%になる。`alwaysCrit: false`、`baseMultiplier: 1.5`。
- W（Spirit Cleave）: 物理ダメージ（5/10/15/20/25 + 防御側最大HP 4/4.5/5/5.5/6%）と魔法ダメージ（同値）の2成分。  
  LoL Wiki 確認値。Meraki は物理成分合計（10/20/30/40/50）を返している（5+5 の合算値）。  
  魔法ダメージの HP% 成分は `skillOverrides.W` で formula として設定する。  
  物理 HP% 成分はモデルでは対応しないため、Meraki の物理 baseDamage をそのまま使用。

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Mortal Steel | physical | 突き/竜巻 |
| W | Spirit Cleave | magic | skillOverrides: 防御側最大HP 4/4.5/5/5.5/6% 魔法ダメージ成分 |
| E | Soul Unbound | true | 霊魂体ダッシュ（真ダメージ） |
| R | Fate Sealed | physical | 引き戻しコンボ |

## 既知の制限

- パッシブによるクリット率2倍は現モデルに反映されない（Yasuoと同様）
- W の物理 HP% 成分（4/4.5/5/5.5/6%）は skillOverrides では表現できないため未反映（物理 base はMerakiの 10/20/30/40/50 で代替）
