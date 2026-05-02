# StatsComputer（lol/damage-calc）

`Champion`（species + level + items）から最終ステータス `ComputedStats` を計算するドメインサービス。

---

## 関数

```typescript
function computeStats(champion: Champion): ComputedStats
```

### 処理フロー

1. レベル補正式でチャンピオンの基礎ステータス（AD/HP/装甲/MR）を算出：
   ```
   stat_at_level = base + growth × (level - 1) × (0.7025 + 0.0175 × (level - 1))
   ```
2. 装備アイテム全件の stats を加算してボーナスステータスを算出
3. `ComputedStats` を生成して返す

### 加算ルール

| フィールド | 計算 |
|---|---|
| `totalAd` | ad_at_level + Σ items.stats.ad |
| `bonusAd` | Σ items.stats.ad |
| `ap` | Σ items.stats.ap |
| `armor` | armor_at_level + Σ items.stats.armor |
| `magicResist` | mr_at_level + Σ items.stats.magicResist |
| `hp` | hp_at_level + Σ items.stats.hp |
| `lethality` | Σ items.stats.lethality |
| `armorPenPercent` | Σ items.stats.armorPenPercent |
| `magicPenFlat` | Σ items.stats.magicPenFlat |
| `magicPenPercent` | Σ items.stats.magicPenPercent |

詳細は `domain/rules.md` の「総ステータス計算」を参照。
