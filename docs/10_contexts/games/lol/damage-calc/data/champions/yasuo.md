# Yasuo

## champion-passives.json エントリ

```json
"Yasuo": {
  "aaCritOverride": {
    "alwaysCrit": false,
    "baseMultiplier": 1.5
  }
}
```

## 各フィールドの根拠

- パッシブ（Way of the Wanderer）: クリティカルダメージが通常の175%ではなく150%になる。  
  `alwaysCrit: false`（常時クリットではない）、`baseMultiplier: 1.5`（基本クリット倍率150%）。

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Steel Tempest | physical | 突き/竜巻 |
| W | Wind Wall | physical | 壁設置（ダメージなし） |
| E | Sweeping Blade | magic | ダッシュ |
| R | Last Breath | physical | 空中コンボ |

## 要確認

- W（Wind Wall）: ダメージなしのスキルにphysicalが割り当てられているか確認
- Q（Steel Tempest）: 3ヒット目の竜巻（Gathering Storm）と通常突きでダメージが異なる可能性

## 既知の制限

- パッシブによるクリット率2倍（アイテムのクリット率が2倍換算）は現モデルに反映されない（入力値をそのまま使用）
