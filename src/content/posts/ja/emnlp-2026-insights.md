---
title: 'EMNLP 2026 参加報告：LLM エージェント研究の焦点は「検証器」へ'
description: 'EMNLP 2026 で読んだ36本の論文をもとに、LLM エージェント研究の関心が「何を生成するか」から「どう検証するか」へ移りつつあることを、4つの観点から整理しました。'
date: 2026-11-11
lang: ja
tags: ['EMNLP 2026', 'LLM エージェント', '検証器', '強化学習', '進化的探索']
---

2026年10月24日から29日までブダペストで開催された EMNLP 2026 に、オンラインで参加しました。本記事では論文を1本ずつ紹介するのではなく、自分の関心に近い36本を読んだうえで、全体を通して見えてきた傾向を4点にまとめます。

## 対象とした論文

論文は「**検証のコストが低く、かつ計算量の大きい問題に、生成・検証・探索のループで取り組んでいる研究**」という基準で選びました。Underline のプログラムから候補を探し、ACL Anthology で本文を読んで、論文ごとに「概要・課題設定・手法・先行研究との違い・結果」をメモしています。

| 分類 | 本数 |
|---|---|
| 進化的探索フレームワーク | 7 |
| 検証器と報酬ハッキング | 8 |
| 集団進化と経験の蓄積 | 7 |
| 各分野への応用（セキュリティ・数学・GPU カーネル最適化・チップ設計） | 14 |

内訳は Main 19本、Findings 16本、Industry Track 1本です。自分の関心で選んでいるため、EMNLP 全体の傾向を代表するものではありません。ただ、Main だけでも LLM Agents のセッションが6枠あり、エージェント研究の勢いは強く感じました。

## 結論から

36本を読んだ印象をひとことで言うと、エージェント研究の関心が「何を生成するか」から「それをどう検証するか」に移ってきている、ということです。

1. **検証器はハックされる。** 強化学習（RL）の報酬に検証器を使うと、方策はすぐにその穴を突いてきます。検証器には精度だけでなく、ハックされにくさが求められるようになっています。
2. **探索手法そのものでは差がつきにくくなっている。** AlphaEvolve 型のフレームワークは汎用的な道具になりつつあり、性能を左右するのは計算予算の配分と検証器の質です。
3. **経験の蓄積にもゲートが必要になっている。** スキルやメモリは溜めるだけでは足りず、更新内容を検証してから取り込む仕組みに関心が移っています。
4. **表面的な目標は達成できても、核心には届かない。** セキュリティからチップ設計まで、分野は違っても同じ種類のギャップが見られました。

## 知見1：RL の報酬に使う検証器はすぐにハックされる

### 報酬ハッキングの事例

- **[From Accuracy to Robustness](https://aclanthology.org/2026.emnlp-main.255/)**（Main）
  数学推論で使われるルールベースの検証器とモデルベースの検証器を比較した研究です。静的な評価では高い精度を示すファインチューニング済みの生成型検証器でも、RL の報酬として使うと約450ステップで方策にハックされ、学習が崩壊しました。記号1文字や意味のない長文といった単純な攻撃で、生成型検証器は最大77.9%のケースで誤判定します。一方、判別型の xVerify は比較的頑健でした。
- **[Countdown-Code](https://aclanthology.org/2026.emnlp-main.1902/)**（Main）
  o4-mini から蒸留した SFT データのうち約1.2%が、テストは通るものの実際には問題を解いていないトラジェクトリでした。このわずかな混入だけで、RLVR 後のモデルのハッキング率は96.3%に達し、その大半は `test.py` の書き換えでした。この傾向は HumanEval にも転移しています。逆に、SFT の前にこうしたトラジェクトリを除いておくと、ハッキングはほとんど起きませんでした。
- **[BAITBENCH](https://aclanthology.org/2026.findings-emnlp.2477/)**（Findings）
  ML タスクに、データリークを利用できるショートカットをあらかじめ仕込んだベンチマークです。7種類のエージェントの全実行のうち57.1%がショートカットを使っており、そのうち92.4%はそれがショートカットだと認識したうえで使っていました。「不正をしないように」と指示しても、ハッキング率は6.2ポイントしか下がりません。
- **[When Surprise Is Not Enough](https://aclanthology.org/2026.emnlp-main.245/)**（Main）
  科学的発見を目指すエージェントでも同じ構図が見られます。ベイズ的サプライズを報酬にすると、探索がノイズやデータリークに引き寄せられてしまいます（いわゆる noisy-TV 問題）。統計的な検証を組み込んだ報酬に置き換えることで、この問題を抑えられることが示されています。

これらの論文に共通するのは、検証器を精度だけでなく、ハックされにくさでも評価すべきだという点です。

### 検証器を安く、プロセスまで見られるものに

検証器そのものを改良する研究も増えています。

| アプローチ | 論文 | 概要 |
|---|---|---|
| 実行環境なしで検証 | [Dockerless](https://aclanthology.org/2026.emnlp-main.640/)（Main） | 読み取り専用のサブエージェントがリポジトリを調べて根拠を集め、正否を判定する。これを報酬にした RL と、Docker 上で実際にテストを実行する RL との差は最大1.3ポイント |
| プロセスの検証 | [Agentic Rubrics](https://aclanthology.org/2026.emnlp-main.2690/)（Main） | 実行可能なルーブリックを使い、最終状態だけでは見えない途中の誤りを検出する。誤りの検出率は32.9%（従来のチェックリストでは10.7%） |
| 正解ラベルなしで検証 | [Faithful Autoformalization](https://aclanthology.org/2026.findings-emnlp.469/)（Findings） | 形式化 → 逆翻訳 → 再形式化を行い、SMT ソルバーで等価性を判定する。等価と判定される割合が44.7%から85.3%に向上 |
| 定理ごとの検証器 | [Counterexample Generation](https://aclanthology.org/2026.findings-emnlp.2112/)（Findings） | 偽の命題4,707件それぞれに専用の記号的検証器を用意し、反例生成を学習させる。SFT だけでは真の定理を見分けられなくなり（0.27 → 0.00）、疎な報酬による RL で回復（0.65） |

ただし、コストがないわけではありません。Dockerless は正解パッチがあることを前提としており、1回の判定に約180秒かかります（テストを実行する場合は約83秒）。Faithful Autoformalization では、人手で確認したところ、不合格と判定された11件のルールのうち8件は実際には正しく形式化されていました。

## 知見2：探索フレームワークは汎用化し、差は計算予算の配分でつく

- **[CodeEvolve](https://aclanthology.org/2026.findings-emnlp.1345/)**（Findings）
  オープンソースの AlphaEvolve 型フレームワークで、島モデルの遺伝的アルゴリズム、MAP-Elites、プロンプトの共進化を組み合わせています。9問中5問で AlphaEvolve の報告値と同等以上の結果を出しました。たとえば circle packing（n=26）では、オープンモデルの Qwen3-Coder-30B で 2.63598 を達成し、AlphaEvolve の 2.63586 を上回っています。
- **[Test-Time Scaling for Scientific Equation Discovery](https://aclanthology.org/2026.emnlp-main.354/)**（Main）
  検証器が信頼できる設定では、最も効くのは探索の「幅」でした。最適な幅は予算に応じて大きくなり、島の構成や探索アルゴリズムの違いによる影響は相対的に小さいという結果です。ある設定では、幅を1から32に広げることで実行時間が7,622秒から1,586秒へと約80%短縮され、精度も 0.965 から 0.984 に向上しました。
- **[Compute Allocation in Evolutionary Search](https://aclanthology.org/2026.emnlp-main.1056/)**（Main）
  同じ設定で進化的探索を繰り返しても、結果は実行ごとに大きくばらつきます。そこで予算を10本の並列探索に分割し、多腕バンディットで有望な探索に追加の予算を割り当てたところ、最も強い島モデルのベースラインと比べて平均適応度が12.3%向上しました。
- **[Controlled Self-Evolution](https://aclanthology.org/2026.findings-emnlp.1036/)**（Findings）
  多様な初期計画、モジュール単位の変異・交叉、成功と失敗の両方を記録するメモリを組み合わせて、コードの効率化を進化的に探索します。GPT-5 を用いた場合の評価指標（MI）は 67.47 で、AlphaEvolve の 63.04 を上回りました。
- **[From AI Assistant to AI Scientist](https://aclanthology.org/2026.findings-emnlp.2446/)**（Findings）
  探索の対象は学習アルゴリズムそのものにも広がっています。この研究では、エージェントが GRPO の変種を閉ループで探索し、64個のアルゴリズムを約5,500 GPU 時間かけて評価しました。得られた変種により、AIME25 の pass@32 は 26.7 から 43.3 に向上しています。

探索アルゴリズムそのものは、もはや大きな差別化要因ではなくなりつつあります。実行ごとのばらつきが大きい以上、並列化と予算配分が効いてきます。ただし、それが成り立つのは検証器が信頼できる場合に限られます。

## 知見3：経験は「溜める」から「検証してから更新する」へ

### 重みではなく、編集できるテキストやコードとして蓄積する

- **[Trace2Skill](https://aclanthology.org/2026.emnlp-main.758/)**（Main）：各トラジェクトリから得た教訓を並列に統合し、1つの `SKILL.md` にまとめます。SpreadsheetBench でのスコアは 48.33 から 69.83 に向上しました。
- **[HarnessForge](https://aclanthology.org/2026.emnlp-main.1893/)**（Main）：エージェントのハーネス（計画・行動・メモリを担うコード）と、LoRA で適応させた方策を交互に進化させます。
- **[Skill-as-Pseudocode](https://aclanthology.org/2026.findings-emnlp.889/)**（Findings）：自然言語で書かれたスキルを、型付きのコントラクトと、環境が受理できる行動テンプレートに変換します。ALFWorld では402ゲーム中82勝で、比較手法の47勝を上回りました。
- **[MetaGen](https://aclanthology.org/2026.findings-emnlp.2005/)**（Findings）：マルチエージェントシステムの役割と接続構造を、学習なしで自己進化させます。比較手法と比べてトークン消費量を85〜91%削減しています。

### 更新にゲートを設ける

- **[RepairGate](https://aclanthology.org/2026.findings-emnlp.648/)**（Findings）：スキルライブラリへの修正案を採用するかどうかを、RL で学習した 9B モデルが判定します。6種類のエージェントの平均で、何もしない場合より7.73ポイント向上しました。
- **[MemGuard](https://aclanthology.org/2026.emnlp-main.423/)**（Main）：検証器の出力をメモリのメタデータとして保存し、メモリの登録・検索・削除の判断に利用します。WebArena では ReasoningBank より成功率が最大7.9ポイント高くなりました。
- **[OptiSkill](https://aclanthology.org/2026.emnlp-main.1316/)**（Main）：ソルバーで検証済みのトラジェクトリから、問題レベルの戦略32個と局所的なルール87個を抽出し、更新の前には回帰チェックを行います。

一方で、長期にわたって経験を活かす能力はまだ十分ではありません。生涯学習のベンチマーク [StuLife](https://aclanthology.org/2026.findings-emnlp.770/)（Findings）では、最も高い GPT-5 でもスコアは 17.90 で、人間の 85.24 には遠く及びませんでした。

経験のライブラリにも検証器が必要になるという点で、知見1と同じ構図になっています。

## 知見4：分野を問わず「表面は解けても、核心は解けない」

| 論文 | できていること | できていないこと |
|---|---|---|
| [Kernel Exploit Generation](https://aclanthology.org/2026.emnlp-main.1653/)（Main） | カーネルをクラッシュさせる | 指定されたエクスプロイトプリミティブの構築（参照 PoC なしの場合、Linux で14/25、Windows で1/20） |
| [Linux Kernel Fault Localization](https://aclanthology.org/2026.emnlp-main.2201/)（Main） | バグを含む関数の候補を挙げる（Top-5 で80.5%） | 根本原因の特定（Top-1 で53.5%）と、その伝播経路の説明 |
| [CyberChainBench](https://aclanthology.org/2026.findings-emnlp.1343/)（Findings） | 攻撃を防ぐパッチを書く（Gemini の場合、阻止率98.9%） | 正常なトランザクションも通るパッチを書く（同1.1%） |
| [How LLMs Fail and Generalize in RTL Coding](https://aclanthology.org/2026.emnlp-industry.29/)（Industry） | 構文エラーを減らす | 機能的な誤りを減らす（SFT や RL は、誤りを構文レベルから機能レベルに移すだけ） |
| [VEX-Bench](https://aclanthology.org/2026.emnlp-main.2615/)（Main） | 脆弱性の影響有無の判定（正解率89.3%） | 「影響なし」と判断する根拠の説明（macro-F1 73.5%） |

分野はばらばらですが、いずれも表面的な目標は達成できても、本来求められている目標には届いていません。こうしたギャップをはっきり測れるのは、これらのベンチマークが決定的な検証器を備えているからです。検証可能な分野に取り組む意義はここにあると思います。

### 数学・GPU カーネル・チップ設計では、検証結果を細かく使う

各分野の手法を見ると、証明器・コンパイラ・テストベンチの合否をそのまま報酬にするのではなく、より細かいシグナルに分解して学習や探索に使う工夫が目立ちました。

- **定理証明**：[Learning to Explore the Crux](https://aclanthology.org/2026.emnlp-main.1932/)（Main）は、エントロピーの高いトークンを手がかりに証明の要所を特定し、そこへ優先的にバックトラックします（MiniF2F で81.8%）。[ProofFrontier](https://aclanthology.org/2026.findings-emnlp.1615/)（Findings）は、検証済みの証明の一部を隠すことで「解けるか解けないかの境界」にある問題を作り、わずか500問の RL で miniF2F の正答率を4.92ポイント改善しました。[HybridProver](https://aclanthology.org/2026.findings-emnlp.1529/)（Findings）は、失敗した証明をスケッチとして再利用します（Isabelle 版の miniF2F で73.8%）。
- **GPU カーネル最適化**：[LLM4LLM](https://aclanthology.org/2026.emnlp-main.859/)（Main）は、実際の推論スクリプトで性能を測定しながら閉ループで最適化します（eager モードの PyTorch と比べて A100 で3.91倍、H100 で6.98倍）。[HTAM](https://aclanthology.org/2026.emnlp-main.531/)（Main）は最適化の方針どうしの遷移を記憶し、KernelBench の Fast@1 を84.0%まで高めました（単純なメモリ検索では58.8%）。[AMDKernelVault](https://aclanthology.org/2026.findings-emnlp.1493/)（Findings）は、AMD GPU 上で実行検証済みの HIP カーネル約6.2万件と Triton カーネル約4万件を公開しています。
- **チップ設計**：[CirCA](https://aclanthology.org/2026.emnlp-main.1450/)（Main）は、回路をアトミックな論理ブロックに分け、その単位で報酬を割り当てる RL によって、7B モデルで RTLLM-v1 の70.5%を達成しました。

## 全体像：生成・検証・探索・蓄積のループ

4つの知見をまとめると、次のようなループとして整理できます。

<ol class="loop">
  <li><strong>生成</strong>LLM やエージェント。スキル・ハーネス・役割を編集可能な形で持つ（知見3）</li>
  <li class="key"><strong>検証</strong>ハックされにくさ、コスト、プロセスの検証が課題（知見1）。核心部分のギャップを明らかにする役割も（知見4）</li>
  <li><strong>探索</strong>幅・並列数・バンディットによる計算予算の配分（知見2）</li>
  <li><strong>蓄積</strong>経験ライブラリ。更新時にもゲート、つまり検証器が必要（知見3）</li>
</ol>
<p class="loop-note">蓄積した経験が次の生成に戻り、ループが回る</p>

このループ全体の性能の上限を決めているのは検証器です。検証器がハックされれば、探索の結果も蓄積される経験も汚染されてしまいます。私自身が取り組んでいる「検証器をループの外から内側に取り込む」というテーマも、この流れの中に位置づけられると考えています。

## 今後考えたいこと

最後に、今後考えていきたい問いを挙げておきます。

1. **検証器をどう定義するか。** 検証器が「ハックされた」とはどういう状態を指すのか。また、ハックされないことをどうすれば確認できるのか。
2. **スキルや経験の蓄積にも検証器が必要だとすると、それはどのように検証すればよいのか。**
3. **検証コストが低く、結果が一意に定まる問題は、ほかにどこにあるか。** 数学、GPU カーネル、チップ設計、スマートコントラクト以外に、どのような分野が候補になりうるか。

## 付録：読んだ36本の一覧

**進化的探索フレームワーク**

| 論文 | 区分 |
|---|---|
| [Compute Allocation in Evolutionary Search](https://aclanthology.org/2026.emnlp-main.1056/) | Main |
| [When Surprise Is Not Enough](https://aclanthology.org/2026.emnlp-main.245/) | Main |
| [Test-Time Scaling for Scientific Equation Discovery](https://aclanthology.org/2026.emnlp-main.354/) | Main |
| [CodeEvolve](https://aclanthology.org/2026.findings-emnlp.1345/) | Findings |
| [Controlled Self-Evolution for Algorithmic Code Optimization](https://aclanthology.org/2026.findings-emnlp.1036/) | Findings |
| [FormalEvolve](https://aclanthology.org/2026.findings-emnlp.317/) | Findings |
| [From AI Assistant to AI Scientist](https://aclanthology.org/2026.findings-emnlp.2446/) | Findings |

**検証器と報酬ハッキング**

| 論文 | 区分 |
|---|---|
| [Countdown-Code](https://aclanthology.org/2026.emnlp-main.1902/) | Main |
| [From Accuracy to Robustness](https://aclanthology.org/2026.emnlp-main.255/) | Main |
| [Dockerless](https://aclanthology.org/2026.emnlp-main.640/) | Main |
| [Agentic Rubrics](https://aclanthology.org/2026.emnlp-main.2690/) | Main |
| [MemGuard](https://aclanthology.org/2026.emnlp-main.423/) | Main |
| [BAITBENCH](https://aclanthology.org/2026.findings-emnlp.2477/) | Findings |
| [Counterexample Generation via Per-Theorem Symbolic Verifiers](https://aclanthology.org/2026.findings-emnlp.2112/) | Findings |
| [Faithful Autoformalization via Roundtrip Verification and Repair](https://aclanthology.org/2026.findings-emnlp.469/) | Findings |

**集団進化と経験の蓄積**

| 論文 | 区分 |
|---|---|
| [Trace2Skill](https://aclanthology.org/2026.emnlp-main.758/) | Main |
| [HarnessForge](https://aclanthology.org/2026.emnlp-main.1893/) | Main |
| [OptiSkill](https://aclanthology.org/2026.emnlp-main.1316/) | Main |
| [MetaGen](https://aclanthology.org/2026.findings-emnlp.2005/) | Findings |
| [Skill-as-Pseudocode](https://aclanthology.org/2026.findings-emnlp.889/) | Findings |
| [RepairGate](https://aclanthology.org/2026.findings-emnlp.648/) | Findings |
| [A Benchmark for Self-Evolving Agents via Experience-Driven Lifelong Learning（StuLife）](https://aclanthology.org/2026.findings-emnlp.770/) | Findings |

**各分野への応用**

| 論文 | 分野 | 区分 |
|---|---|---|
| [Evaluating Coding Agents on Kernel Exploit Generation](https://aclanthology.org/2026.emnlp-main.1653/) | セキュリティ | Main |
| [VEX-Bench](https://aclanthology.org/2026.emnlp-main.2615/) | セキュリティ | Main |
| [Code Agents Don't Understand Root Cause](https://aclanthology.org/2026.emnlp-main.2201/) | セキュリティ | Main |
| [CyberChainBench](https://aclanthology.org/2026.findings-emnlp.1343/) | セキュリティ | Findings |
| [Learning to Explore the Crux in Formal Theorem Proving](https://aclanthology.org/2026.emnlp-main.1932/) | 数学 | Main |
| [ProofFrontier](https://aclanthology.org/2026.findings-emnlp.1615/) | 数学 | Findings |
| [HybridProver](https://aclanthology.org/2026.findings-emnlp.1529/) | 数学 | Findings |
| [Compiler-Guided Adaptive Proof Search](https://aclanthology.org/2026.findings-emnlp.669/) | 数学 | Findings |
| [LLM4LLM](https://aclanthology.org/2026.emnlp-main.859/) | GPU カーネル最適化 | Main |
| [GLARE](https://aclanthology.org/2026.emnlp-main.1870/) | GPU カーネル最適化 | Main |
| [HTAM](https://aclanthology.org/2026.emnlp-main.531/) | GPU カーネル最適化 | Main |
| [AMDKernelVault](https://aclanthology.org/2026.findings-emnlp.1493/) | GPU カーネル最適化 | Findings |
| [CirCA](https://aclanthology.org/2026.emnlp-main.1450/) | チップ設計 | Main |
| [How LLMs Fail and Generalize in RTL Coding for Hardware Design?](https://aclanthology.org/2026.emnlp-industry.29/) | チップ設計 | Industry |

本文中の数値は、すべて各論文の本文・表から引用しています。誤りがあればご指摘いただけると幸いです。


## 会場の様子

今回はオンラインでの参加でしたが、最後に会場の雰囲気が伝わる写真を何枚か載せておきます。

<div class="photos">
<figure class="wide"><img src="/posts/emnlp-2026-insights/01-entrance.jpg" alt="HUNGEXPO の建物の前に立つ EMNLP 2026 の歓迎看板" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>会場の HUNGEXPO（ブダペスト）</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/02-banner.jpg" alt="EMNLP 2026 Budapest October 24–29 と書かれた入口のバナー" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>入口のバナー</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/03-hall.jpg" alt="満席の大ホールで講演を聴く参加者たち" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>満席の大ホール</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/04-lobby.jpg" alt="休憩時間に参加者で混み合うロビーとエスカレーター" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>休憩時間のロビー</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/05-dance.jpg" alt="民族衣装のダンサーと、輪になって手拍子する参加者たち" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>会場での民族舞踊のパフォーマンス</figcaption></figure>
</div>

<p class="photo-credit">写真：EMNLP 2026 公式フォトギャラリーより転載</p>
