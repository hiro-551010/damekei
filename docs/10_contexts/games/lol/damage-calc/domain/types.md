# ドメイン型（lol/damage-calc）

ドメイン全体で使用するプリミティブな型定義。

---

## DamageType

ダメージの種別。

```typescript
type DamageType = "physical" | "magic" | "true";
```

| 値 | 説明 |
|---|---|
| `"physical"` | 物理ダメージ。防御力と物理貫通で軽減される |
| `"magic"` | 魔法ダメージ。魔法耐性と魔法貫通で軽減される |
| `"true"` | 真のダメージ。耐性を無視する |

---

## SkillSlot

スキルスロットの識別子。

```typescript
type SkillSlot = "Q" | "W" | "E" | "R";
```

---

## StatRef

ダメージ計算式（DamageFormula）のスケーリング元となるステータス参照。

```typescript
type StatRef =
  // 攻撃側
  | "attacker.totalAd"
  | "attacker.bonusAd"
  | "attacker.baseAd"           // totalAd - bonusAd
  | "attacker.ap"
  | "attacker.moveSpeed"
  | "attacker.bonusMoveSpeed"
  | "attacker.bonusArmor"
  | "attacker.bonusMagicResist"
  | "attacker.maxHp"
  | "attacker.stackCount"
  // 防御側
  | "defender.maxHp"
  | "defender.currentHp"        // 計算機は満HP前提なので maxHp と同値
  | "defender.missingHp"        // maxHp - currentHp（満HP前提では 0）
  | "defender.armor"
  | "defender.magicResist"
```

| 値 | 説明 |
|---|---|
| `"attacker.totalAd"` | 攻撃側の総AD（基礎AD + ボーナスAD） |
| `"attacker.bonusAd"` | 攻撃側のボーナスAD（アイテム由来） |
| `"attacker.baseAd"` | 攻撃側の基礎AD（`totalAd - bonusAd`） |
| `"attacker.ap"` | 攻撃側の魔力 |
| `"attacker.moveSpeed"` | 攻撃側の移動速度（基礎 + アイテムボーナス） |
| `"attacker.bonusMoveSpeed"` | 攻撃側のアイテム由来の移動速度 |
| `"attacker.bonusArmor"` | 攻撃側のアイテム由来のアーマー |
| `"attacker.bonusMagicResist"` | 攻撃側のアイテム由来のMR |
| `"attacker.maxHp"` | 攻撃側の最大HP |
| `"attacker.stackCount"` | 攻撃側のスタック数（Nasus Q / Veigar パッシブ等。省略時は 0） |
| `"defender.maxHp"` | 防御側の最大HP |
| `"defender.currentHp"` | 防御側の現在HP（計算機は満HP前提のため `maxHp` と同値） |
| `"defender.missingHp"` | 防御側の欠けたHP（計算機は満HP前提のため 0） |
| `"defender.armor"` | 防御側の総防御力 |
| `"defender.magicResist"` | 防御側の総魔法耐性 |

---

## DamageFormula

ダメージ計算式の式ツリー（DSL）。評価器（FormulaEvaluator）が再帰的に評価する。

```typescript
type DamageFormula =
  | { kind: "const"; value: number }
  | { kind: "byRank"; values: number[] }      // ランク別配列（Q/W/Eは length 5、Rは length 3）
  | { kind: "byLevel"; values: number[] }     // レベル別配列（length 18）
  | { kind: "stat"; ref: StatRef }
  | { kind: "add"; operands: DamageFormula[] }
  | { kind: "mul"; operands: DamageFormula[] }
  | { kind: "min"; operands: [DamageFormula, DamageFormula] }
  | { kind: "max"; operands: [DamageFormula, DamageFormula] }
  | { kind: "clamp"; value: DamageFormula; min: DamageFormula; max: DamageFormula }
```

| kind | 説明 |
|---|---|
| `"const"` | 定数値。`value` をそのまま返す |
| `"byRank"` | ランク別配列。`values[skillRank - 1]` を返す。Q/W/E は length 5、R は length 3 |
| `"byLevel"` | レベル別配列。`values[championLevel - 1]` を返す。length 18 |
| `"stat"` | ステータス参照。`StatRef` で指定した値を返す |
| `"add"` | 加算。全 operands を評価して合計する |
| `"mul"` | 乗算。全 operands を評価して積を返す |
| `"min"` | 最小値。2つの operands を評価して小さい方を返す |
| `"max"` | 最大値。2つの operands を評価して大きい方を返す |
| `"clamp"` | 範囲クランプ。`value` を `[min, max]` の範囲に収める |

---

## EvaluationContext

DamageFormula の評価器（FormulaEvaluator）への入力。

```typescript
type EvaluationContext = {
  attacker: ComputedStats;  // 攻撃側の最終ステータス（stackCount は optional 拡張）
  defender: ComputedStats;  // 防御側の最終ステータス（満HP前提）
  skillRank: number;        // 評価するスキルランク（1〜5 または 1〜3）
  championLevel: number;    // 攻撃側チャンピオンレベル（1〜18）
  stackCount?: number;      // Nasus Q / Veigar パッシブ等（省略時は 0）
}
```

| フィールド | 説明 |
|---|---|
| `attacker` | 攻撃側の最終ステータス（`StatsComputer` が算出した `ComputedStats`） |
| `defender` | 防御側の最終ステータス（満HP前提。`defender.currentHp === defender.maxHp`） |
| `skillRank` | 評価対象スキルのランク。`byRank` ノードのインデックスに使用 |
| `championLevel` | 攻撃側チャンピオンのレベル。`byLevel` ノードのインデックスに使用 |
| `stackCount` | スタック依存スキル用の追加入力。省略時は 0 として扱う |
