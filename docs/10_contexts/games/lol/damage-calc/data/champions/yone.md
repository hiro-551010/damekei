# Yone

## champion-passives.json エントリ

```json
"Yone": {
  "aaCritOverride": {
    "alwaysCrit": false,
    "baseMultiplier": 1.5
  }
}
```

## 各フィールドの根拠

- パッシブ（Way of the Hunter）: ヤスオと同様にクリティカルダメージが150%になる。  
  `alwaysCrit: false`、`baseMultiplier: 1.5`。

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Mortal Steel | physical | 突き/竜巻 |
| W | Spirit Cleave | physical | 精神斬り（物理＋%最大HP魔法） |
| E | Soul Unbound | true | 霊魂体ダッシュ（真ダメージ） |
| R | Fate Sealed | physical | 引き戻しコンボ |

## 要確認

- W（Spirit Cleave）: 物理+最大HP%魔法ダメージの2成分を持つがMerakiはphysicalのみ格納の可能性

## 既知の制限

- パッシブによるクリット率2倍は現モデルに反映されない（Yasuoと同様）
- W の最大HP%魔法ダメージ成分は現在のスキルモデルでは表現不可
