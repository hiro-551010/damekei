# Kha'Zix（カジックス）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Khazix": {
    "skillVariants": {
      "Q": [{ "name": "Q（孤立対象）", "multiplier": 1.8 }]
    }
  }
}
```

## 各フィールドの根拠

### skillVariants.Q（Taste Their Fear）

- 周囲に敵がいない孤立したターゲットへの Q はダメージが 80% 増加する（通常の 1.8 倍）
- Meraki は通常ヒット時の値を返すと想定
- LoL Wiki「Kha'Zix」Q 項目より

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Taste Their Fear） | physical。Meraki が通常ヒット時のダメージ値を返す |
| W（Void Spike） | physical。Meraki 値をそのまま使用 |
| E（Leap） | physical。Meraki 値をそのまま使用 |
| R（Void Assault） | ダメージなし（ステルスダッシュ）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Unseen Threat） | ステルス後の次 AA に追加 magic ダメージ。条件付き発動のため計算機では対応しない |
| スキル進化ボーナス | R で各スキルを進化させると効果が追加されるが、進化状態の個別対応は未実装 |
