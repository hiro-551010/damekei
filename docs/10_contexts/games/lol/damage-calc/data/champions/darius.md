# Darius（ダリウス）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Darius": {
    "skillVariants": {
      "Q": [{ "name": "Q（柄ヒット）", "multiplier": 0.5 }]
    }
  }
}
```

## 各フィールドの根拠

### skillVariants.Q（Decimate）

- Meraki は Q の最大ダメージ（外縁＝剣刃ヒット）を返す
- 剣の柄（内側）にヒットした場合はダメージが 50% になる（`multiplier: 0.5`）
- LoL Wiki「Darius」Q 項目より

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Decimate） | physical。Meraki が剣刃ヒット（最大ダメージ）の値を返す |
| W（Crippling Strike） | physical。次の AA を強化するスキル。Meraki が強化 AA のダメージ値を返す |
| E（Apprehend） | ダメージなし（引き寄せ + パッシブ防御貫通）。preMitigation = 0 で問題なし |
| R（Noxian Guillotine） | true。Meraki が基礎ダメージ値を返す |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Hemorrhage） | 出血スタックによる継続 physical ダメージ。条件付き継続ダメージのため計算機では対応しない |
| R Hemorrhage スタックボーナス | 5 スタック時の R ダメージ増加はスタック依存のため対応しない |
| Passive（Noxian Might） | Hemorrhage 5 スタック達成時に得られる基礎 AD ボーナス。パッシブ条件トリガーのため stateModifier としては未実装 |
