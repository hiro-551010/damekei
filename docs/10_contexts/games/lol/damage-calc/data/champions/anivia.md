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
| R（Glacial Storm） | ティックダメージ。1 秒あたりの値を Meraki が提供。追加実装不要 |
| Passive（Rebirth） | 卵からの復活。ダメージ出力に影響なし |
