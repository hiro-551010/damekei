# Aatrox（アートロックス）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Aatrox": {
    "passiveSpec": {
      "kind": "onHitMaxHpPercent",
      "percentByLevel": [4.0, 4.39, 4.79, 5.18, 5.58, 5.97, 6.37, 6.76, 7.16, 7.55, 7.95, 8.34, 8.74, 9.13, 9.53, 9.92, 10.32, 10.71],
      "damageType": "physical"
    },
    "skillVariants": {
      "Q": [{ "name": "スイートスポット", "multiplier": 1.7 }]
    },
    "stateModifiers": [
      {
        "kind": "bonusAdFromBaseAd",
        "name": "R (World Ender)",
        "triggerSlot": "R",
        "percentByRank": [20, 30, 40]
      }
    ]
  }
}
```

## 各フィールドの根拠

### passiveSpec（Deathbringer Stance）

- `kind: onHitMaxHpPercent` — AA ヒット時に相手最大 HP × % の物理ダメージを追加
- `percentByLevel` — LoL Wiki「Aatrox」ページの Deathbringer Stance より取得（Lv1: 4.0%、Lv18: 10.71%）
- クールダウン（4 hit ごと）は計算機の対象外（AA ごとに発動する前提で計算）

### skillVariants.Q（The Darkin Blade）

- Q は 3 回まで振れるが、計算機は1振り分のダメージを表示
- スイートスポット（剣の先端）は通常ヒットの **1.7 倍**（`multiplier: 1.7`）
- Meraki データ（`champions.json`）の Q 値はスイートスポット外の1振り分

### stateModifiers（World Ender / R）

- `kind: bonusAdFromBaseAd` — R 発動中、基礎 AD の一定%分だけボーナス AD が増加
- `percentByRank: [20, 30, 40]` — ランク別増加率（%）。LoL Wiki「Aatrox」R 項目より
- `triggerSlot: R` — スキル振り分けで R ランク 0 の場合は非表示
- R によるヒール・移動速度増加はダメージ計算対象外

### 対象外スキル

| スキル | 理由 |
|---|---|
| W (Infernal Chains) | 両ヒット合計を Meraki が提供するため champions.json で完結 |
| E (Umbral Dash) | ダメージなし（移動 + AD バフはパッシブとして別途機能） |
