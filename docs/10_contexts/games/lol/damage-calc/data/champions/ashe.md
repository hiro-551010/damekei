# Ashe（アッシュ）champion-passives.json

## champion-passives.json エントリ

```json
{
  "Ashe": {
    "aaCritOverride": {
      "alwaysCrit": true,
      "baseMultiplier": 1.10
    }
  }
}
```

## 各フィールドの根拠

### aaCritOverride（Focus パッシブ）

Ashe のパッシブ（Focus）により AA は**常にクリティカル**するが、倍率が通常と異なる。

| 状態 | 通常チャンピオン | Ashe |
|---|---|---|
| アイテムなし | クリット行非表示 | 110%（常に表示） |
| クリットアイテム装備時のbase | 175% | 110% |

- `alwaysCrit: true` — critChance = 0 でもクリット行を表示する
- `baseMultiplier: 1.10` — 1.75 の代わりに 1.10 を使用
- IE 等の `critDamageAmp` パッシブは `baseMultiplier` に加算される（minCritChance 条件を満たす場合）

### 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Ranger's Focus） | 強化 AA。tAD 比率として Meraki が提供。追加実装不要 |
| W（Volley） | physical + bonusAD。Meraki 値をそのまま使用 |
| E（Hawkshot） | ダメージなし（偵察）。空値のため preMitigation = 0 で問題なし |
| R（Enchanted Crystal Arrow） | magic。Meraki 値をそのまま使用 |
