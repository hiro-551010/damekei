# Karthus（カーサス）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Karthus": {
    "skillVariants": {
      "Q": [{ "name": "Q（AoE ヒット）", "multiplier": 0.5 }]
    }
  }
}
```

## 各フィールドの根拠

### skillVariants.Q（Lay Waste）

- Q は単体ヒットで 2 倍ダメージ、複数体ヒットで通常ダメージ
- Meraki は単体ヒット時（最大値）を返すと想定
- AoE ヒット版は単体の 50%（`multiplier: 0.5`）
- LoL Wiki「Karthus」Q 項目より

> **要確認**: Meraki が AoE 値（低い方）を返す場合は multiplier を `2.0` に変更すること

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Lay Waste） | magic。Meraki が単体ヒット時（最大）ダメージを返すと想定 |
| W（Wall of Pain） | ダメージなし（スロー + MR 減少）。preMitigation = 0 で問題なし |
| E（Defile） | magic。トグル中の1ティックあたりのダメージを Meraki が返す |
| R（Requiem） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Death Defied） | 死亡後 7 秒間スキルを使い続けられる。ダメージ倍率には影響しない |
