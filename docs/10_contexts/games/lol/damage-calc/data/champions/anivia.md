# Anivia（アニビア）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Anivia": {
    "skillVariants": {
      "E": [{ "name": "E（凍結対象）", "multiplier": 2.0 }]
    }
  }
}
```

## 各フィールドの根拠

### skillVariants.E（Frostbite）

凍結（Chilled）状態の対象にはダメージが 2 倍になる。
`multiplier: 2.0` として通常 E 値の 2 倍をバリアントで表示する。

### 対象外

| 項目 | 理由 |
|---|---|
| Q（Flash Frost） | hit + 爆発の 2 段ダメージだが、Meraki が合計値を提供。追加実装不要 |
| W（Crystallize） | ダメージなし（壁生成のみ） |
| Passive（Rebirth） | 卵からの復活。ダメージ出力に影響なし |

## R（Glacial Storm）の扱い

Meraki が返す値は **1 秒あたりのティックダメージ**（Rank1: 15 magic + 6.25% AP / s）。
ダメージ結果表には「R（1秒あたり）」として表示し、継続時間によって総ダメージが変わることをラベルで明記する。
