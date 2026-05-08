# FormulaEvaluator（lol/damage-calc）

`DamageFormula` ノードツリーを `EvaluationContext` に対して再帰的に評価し、数値を返すドメインサービス。

---

## 関数

```typescript
function evaluate(formula: DamageFormula, context: EvaluationContext): number
```

### 入力

| 引数 | 型 | 説明 |
|---|---|---|
| `formula` | `DamageFormula` | 評価する式ノード（再帰構造） |
| `context` | `EvaluationContext` | 攻撃側・防御側 ComputedStats、skillRank、championLevel、stackCount |

### 出力

`number` — 評価結果

---

## ノード評価ルール

各ノードの `kind` に応じて以下のルールで評価する。

| kind | 評価ルール |
|---|---|
| `const` | `value` をそのまま返す |
| `byRank` | `values[skillRank - 1]` を返す（範囲外は 0） |
| `byLevel` | `values[championLevel - 1]` を返す（範囲外は 0） |
| `stat` | `StatRef` に対応するステータスを `context` から取得して返す（下記参照） |
| `add` | 全 `operands` を評価して合計する（空の場合 0） |
| `mul` | 全 `operands` を評価して積を返す（空の場合 1） |
| `min` | 2つの `operands` を評価して小さい方を返す |
| `max` | 2つの `operands` を評価して大きい方を返す |
| `clamp` | `value` を評価し `max(min, min(value, max))` を返す |

---

## StatRef の解決ルール

| StatRef | 解決先 |
|---|---|
| `attacker.totalAd` | `context.attacker.totalAd` |
| `attacker.bonusAd` | `context.attacker.bonusAd` |
| `attacker.baseAd` | `context.attacker.baseAd`（= totalAd − bonusAd） |
| `attacker.ap` | `context.attacker.ap` |
| `attacker.moveSpeed` | `context.attacker.moveSpeed` |
| `attacker.bonusMoveSpeed` | `context.attacker.bonusMoveSpeed` |
| `attacker.bonusArmor` | `context.attacker.bonusArmor` |
| `attacker.bonusMagicResist` | `context.attacker.bonusMagicResist` |
| `attacker.maxHp` | `context.attacker.hp` |
| `attacker.stackCount` | `context.stackCount ?? 0` |
| `defender.maxHp` | `context.defender.hp` |
| `defender.currentHp` | `context.defender.hp`（満HP前提） |
| `defender.missingHp` | `0`（満HP前提） |
| `defender.armor` | `context.defender.armor` |
| `defender.magicResist` | `context.defender.magicResist` |

> フェーズ2では `defender.currentHp` を満HP固定とし、`defender.missingHp = 0` とする。
> フェーズ3で UI に現在HP入力を追加した際に評価を実際の値に切り替える。
