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
