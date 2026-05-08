# DamageCalculator（lol/damage-calc）

攻撃側・防御側の `Champion` を受け取り、Q/W/E/R 全スキルのダメージを計算するドメインサービス。

---

## 関数

```typescript
function calculateDamage(attacker: Champion, defender: Champion): DamageResult
```

### 処理フロー

1. `computeStats(attacker)` / `computeStats(defender)` で最終ステータスを算出
2. 攻撃側の各スキルに対して以下を計算：
   - rank = 0（未習得）の場合、全値 0 で返す
   - `EvaluationContext` を構築（attacker/defender の ComputedStats、skillRank、championLevel、stackCount）
   - `preMitigation` = `evaluate(skill.damageFormula, context)`（FormulaEvaluator を使用）
   - `preMitigation === 0` のスキルは結果から除外する（0ダメージフィルタ）
   - `effectiveResistance` = 貫通適用後の有効防御力（物理）or 有効MR（魔法）。真のダメージは 0
   - `postMitigation` = preMitigation × 100 / (100 + effectiveResistance)
   - `reductionPercent` = (preMitigation - postMitigation) / preMitigation × 100
   - `hpPercent` = postMitigation / defender.hp × 100
3. `DamageResult` にまとめて返す

### 貫通の適用順序

物理ダメージ：`armor × (1 - armorPenPercent/100) - lethality`（下限 0）

魔法ダメージ：`magicResist × (1 - magicPenPercent/100) - magicPenFlat`（下限 0）

詳細な計算式は `domain/rules.md` の「ダメージ計算式」を参照。
`evaluate` 関数の詳細は `domain/services/formula-evaluator.md` を参照。
