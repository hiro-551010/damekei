# Aphelios（アフェリオス）champion-passives.json

## champion-passives.json エントリ

なし（**実装スキップ**）。

## 実装スキップの理由

Aphelios は 5 種の武器（Calibrum / Severum / Gravitum / Infernum / Crescendum）を循環使用する特殊な仕組みを持つ。
Meraki もすべてのスキルで空値を返しており、通常のスキル係数モデルでは表現できない。

AA についても武器ごとにダメージ特性が異なる（特に Crescendum はチャクラム数で倍率が変化）ため、
汎用モデルでの正確な実装が困難。**damage-calc の対象外**とする。

標準 AA 表示（基礎 AD + アイテムによる物理 AA）は引き続き表示されるが、武器別の差異は反映されない。
