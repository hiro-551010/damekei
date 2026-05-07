# Jhin（ジン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Dancing Grenade） | physical。Meraki が基礎ダメージ値を返す |
| W（Deadly Flourish） | physical。Meraki 値をそのまま使用 |
| E（Captive Audience） | physical。トラップの爆発ダメージを Meraki が返す |
| R（Curtain Call） | physical。Meraki が1発あたりのダメージ値を返す |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はバウンスするたびにダメージが増加（直前のターゲットがキルされた場合）。Meraki が初弾の固定値を返しているか確認すること |
| R ダメージ値 | R の4発目はクリティカル（300% + 残 HP%）。Meraki が通常弾1発分のみを返しているかを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| AA の固定クリット（4発目） | Jhin の4発目 AA は常にクリティカルして 300% + 残 HP% 追加ダメージを与える。`aaCritOverride` で `alwaysCrit` を表現することはできるが「4発目のみ」という周期条件が実装されていないため、計算機の AA 行は標準 AA（1〜3発目）の値として扱う |
| パッシブ AD スケーリング | Jhin は クリット確率・ボーナス AS を AD に変換する固有スケーリングを持つが、Meraki の標準ステータスには含まれない |
