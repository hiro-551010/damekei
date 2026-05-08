# ドメインルール（lol/damage-calc）

## チャンピオンレベル

| 項目 | 値 |
|---|---|
| 範囲 | 1〜18 |

## スキルポイント振り分け（SkillAllocation）

チャンピオンレベルに応じてスキルポイントを Q/W/E/R に振り分ける。

### 基本ルール

| ルール | 内容 |
|---|---|
| 総スキルポイント | チャンピオンレベルと同数（level = q + w + e + r） |
| Q / W / E の最大ランク | 5 |
| R の最大ランク | 3 |
| 各スキルの最小ランク | 0（未習得） |

### R の習得レベル制限

R はチャンピオンレベルが一定以上でないとランクアップできない。

| R のランク | 必要チャンピオンレベル |
|---|---|
| 1 | 6 以上 |
| 2 | 11 以上 |
| 3 | 16 以上 |

計算式: `r ≤ max(0, floor((level - 1) / 5))`

## Build（ビルド）

| ルール | 内容 |
|---|---|
| 最大アイテム数 | 6 |
| 同一アイテムの重複 | 禁止（ユニークパッシブの重複を防ぐため） |

## 総ステータス計算（StatsComputer）

### チャンピオンの各ステータスのレベル補正

LoL の標準成長式を使用する。

```
stat_at_level = base + growth × (level - 1) × (0.7025 + 0.0175 × (level - 1))
```

`base` と `growth` は `ChampionSpecies` の `baseStats` / `statGrowth` から取得する。

### 総ステータス合算

```
totalAd    = ad_at_level + Σ(items[*].stats.ad)
bonusAd    = Σ(items[*].stats.ad)
ap         = Σ(items[*].stats.ap)
armor      = armor_at_level + Σ(items[*].stats.armor)
magicResist = mr_at_level + Σ(items[*].stats.magicResist)
hp         = hp_at_level + Σ(items[*].stats.hp)
lethality  = Σ(items[*].stats.lethality)
armorPenPercent = Σ(items[*].stats.armorPenPercent) + Σ(items[*].passives[kind=armorPenPercent].value)
magicPenFlat    = Σ(items[*].stats.magicPenFlat)
magicPenPercent = Σ(items[*].stats.magicPenPercent) + Σ(items[*].passives[kind=magicPenPercent].value)
```

> 複数アイテムの %貫通は加算する（乗算ではない）。LoL の現行仕様に従う。

## ダメージ計算式（DamageCalculator）

### スキルダメージの軽減前ダメージ（preMitigationDamage）

```
preMitigationDamage =
  skill.baseDamageByRank[rank - 1]
  + attacker.totalAd × skill.totalAdRatio
  + attacker.bonusAd × skill.bonusAdRatio
  + attacker.ap      × skill.apRatio
```

### 有効防御力の計算（物理ダメージ）

貫通の適用順序：% 貫通 → Lethality（固定値）の順に適用する。

```
step1 = defender.armor × (1 - attacker.armorPenPercent / 100)
effectiveArmor = max(0, step1 - attacker.lethality)
```

### 有効MRの計算（魔法ダメージ）

```
step1 = defender.magicResist × (1 - attacker.magicPenPercent / 100)
effectiveMR = max(0, step1 - attacker.magicPenFlat)
```

### 最終ダメージ（postMitigationDamage）

```
// 物理ダメージ
postMitigationDamage = preMitigationDamage × 100 / (100 + effectiveArmor)

// 魔法ダメージ
postMitigationDamage = preMitigationDamage × 100 / (100 + effectiveMR)

// 真のダメージ（耐性を無視）
postMitigationDamage = preMitigationDamage
```

> 防御力・MR が負の場合（貫通で 0 を下回るケースは `max(0, ...)` で防ぐ）、
> 計算式の分母は 100 を下回ることがあるが、本実装では有効防御力の下限を 0 とするため該当しない。

### postMitigationDamage の端数処理

小数点以下を切り捨て（`Math.floor`）する。

### 多段ヒットスキルの表示単位

Meraki が複数ヒットの合計値を返す場合、そのまま合計値として表示する。1ヒットあたりの値への変換は行わない。

**理由：** ユーザーが知りたいのは「このスキルを1回使ったときの総ダメージ」であり、内部のヒット数に分解する必要はない。

**適用例：** Graves Q（着弾 + 後方爆発合計）、Katarina R（全ダガー合計）、Lucian R（全弾合計）など。

**例外：** 往路・復路で damageType が異なる場合（Ahri Q など）や、中心ヒットと外周ヒットでダメージが異なる場合は `variants` で別バリアントとして表示する。

### DoT（継続ダメージ）スキルの表示単位

継続時間によって総ダメージが変わる DoT スキルは、Meraki が返す **1秒あたりのダメージ値** をそのまま表示する。スキル名には「（1秒あたり）」を付記する。

**理由：** DoT の総ダメージは「対象が範囲内に留まる時間」に依存し、固定値として表示できない。

**適用例：** Anivia R（Glacial Storm）、Morgana W（Tormented Shadow）、Swain R（Demonic Ascension）など。

**実装：** `champions.json` のスキル名フィールドに「（1秒あたり）」を付記して対応する。champion-passives.json の `skillOverrides.name` で上書きする。

### チャージ時間依存スキルの表示単位

チャージ時間によってダメージが変わるスキル（Sion Q・Varus Q・Irelia W 等）は、Meraki が返す値をそのまま表示する。Meraki は一般的に **最大チャージ時の値** を格納している。

スキル名に「（最大チャージ時）」を付記してユーザーに明示する。付記は `champion-passives.json` の `skillOverrides.name` で上書きする。

### HP%・移動速度比例ダメージの扱い

「現在 HP%」「残 HP%」「移動速度比例」など、対象または自身のステータスに比例するダメージ成分は、現在のモデル（`baseDamage + ratio × stat`）では表現できない。

これらは **既知の制限** としてチャンピオン docs の `## 既知の制限` セクションに記録し、計算機の表示値はその成分を含まない参考値として扱う。実装上の修正は行わない。

### 0ダメージスキルの扱い

スキルスロットの `preMitigationDamage` が 0 の場合、そのスロットを計算結果に含めない。

**理由：** Meraki データがダメージのないスキル（移動・バフ・CC専用スキル等）に `physical` を割り当てつつ `baseDamage: 0` / ratio なしで返すケースが存在する。これらを表示すると「0ダメージ行」がUIに並んでユーザーを混乱させる。

**適用条件：**
- スキルランク ≥ 1（ランク0の未習得スキルは従来通り非表示）
- `preMitigationDamage === 0`（baseDamage = 0 かつ全 ratio = 0）

**スコープ外：** 「本来ダメージがあるが Meraki が誤って 0 を返しているケース」は別途 `skillOverrides` で正しい値に上書きして対応する。

## スコープ外ルール（初期実装では対応しない）

以下は複雑性が高いため、初期スコープ外とする。将来の拡張時にこのファイルを更新すること。

| 項目 | 理由 |
|---|---|
| チャンピオン固有パッシブ（例：ガレンのW、ダリウスのパッシブ） | チャンピオン個別実装が必要 |
| オンヒット効果（例：ウィッツエンド、ナッシャートゥース） | スキルダメージとは別軸の計算 |
| ルーンによるステータス修正 | データソースの拡張が必要 |
| クリティカルダメージ計算 | 確率的要素を含む |
| シールド・ダメージ軽減バフ（防御側） | 試合状況依存 |

## バリデーションのレイヤー責任

- **domain 層**：不変条件の検証（Level 範囲・Build アイテム数上限・スキルランク範囲等）
- **presentation 層**：入力形式のバリデーション（未選択・文字列→数値変換等）
- domain のバリデーション違反は `DomainError` を throw する（`docs/00_governance/error-policy.md` 参照）
