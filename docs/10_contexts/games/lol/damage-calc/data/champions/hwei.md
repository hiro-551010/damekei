# Hwei（ウェイ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

Hwei は「呪文書（Q/W/E）+ 詠唱（Q/W/E）」の組み合わせで9種のスペルを持つ独自システムを採用。
Meraki がどのスペルをどのスロットに割り当てるか不明なため、以下は推定。

| スロット | 内容 |
|---|---|
| Q | Devastation（攻撃）系スペル群のいずれか（magic） |
| W | Serenity（ユーティリティ）系スペル群のいずれか（ダメージなし） |
| E | Torment（CC）系スペル群のいずれか（magic） |
| R（Spiraling Despair） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Meraki スロット割り当て | 9 種のスペルが Q/W/E 3 スロットに対してどのようにマッピングされているかを確認すること。各スペルの baseDamage・ratio が正しいかも確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| 全 9 スペルの個別表示 | 現行の Q/W/E/R スロットモデルでは 9 スペルを区別して表示できない |
