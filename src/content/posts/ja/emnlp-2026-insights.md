---
title: 'EMNLP 2026 参加報告：36本の論文から見えた「検証器中心」の潮流'
description: 'EMNLP 2026 で精読した36本の論文を横断して、LLMエージェント研究の重心が「何を生成するか」から「どう検証するか」へ移りつつあることを、4つの知見にまとめました。'
date: 2026-11-11
lang: ja
tags: ['EMNLP 2026', 'LLM エージェント', '検証器', '強化学習', '進化的探索']
---

2026年10月24日〜29日にブダペストで開催された EMNLP 2026 に、オンラインで参加しました。この記事では、個々の論文を順番に紹介するのではなく、自分の関心に沿って精読した36本を横断して見えてきた傾向を、4つの知見にまとめます。

## 調査の範囲

選定の基準は、「**検証が安く、計算量の大きい問題に、生成 → 検証 → 探索のループで取り組む研究**」です。Underline のプログラムから候補を拾い、ACL Anthology で全文を読んで、論文ごとに「要約・研究課題・手法・改善点・結果」のノートを作りました。

| 方向 | 本数 |
|---|---|
| 進化的探索の枠組み | 7 |
| 検証器と報酬ハッキング | 8 |
| 集団進化と経験の蓄積 | 7 |
| 各分野への応用（セキュリティ・数学・カーネル最適化・チップ設計） | 14 |

内訳は主会 19本、Findings 16本、Industry Track 1本です。関心に基づいて選んでいるので、EMNLP 全体の縮図ではない点はご了承ください。とはいえ、主会では LLM Agents のセッションだけで6枠あり、エージェント研究の存在感はかなり大きいものでした。

## 先に結論

36本を読んで、**エージェント研究の重心は「何を生成するか」から「どう検証するか」へ移りつつある**、というのが私の見立てです。

1. **検証器は攻略される。** 強化学習（RL）の報酬に使った検証器は、方策にすぐ攻略されます。精度だけでなく、攻略されにくさが問われる段階に入りました。
2. **探索手法の差は縮まっている。** AlphaEvolve 型の枠組みは汎用的な道具になり、差を生むのは計算資源の配分と検証器の質になりつつあります。
3. **経験の更新にも関門が要る。** スキルや記憶は貯めるだけでは不十分で、更新を検証してから取り込む仕組みが焦点になっています。
4. **表層は解けても、深層は解けない。** セキュリティ、カーネル、チップ設計など分野をまたいで、同じ形のギャップが見えました。

## 知見1：RL の報酬に使った検証器は、すぐに「攻略」される

### 攻略される検証器

- **[From Accuracy to Robustness](https://aclanthology.org/2026.emnlp-main.255/)**（主会）
  数学推論のルールベース検証器とモデルベース検証器を比較した研究です。静的な評価では精度の高い微調整済みの生成型検証器でも、RL の報酬に使うと約450ステップで方策に攻略され、学習が崩壊しました。記号1文字や長い無意味な文といった単純な攻撃パターンで、生成型検証器は最大77.9%が誤判定しています。一方、判別型の xVerify は比較的頑健でした。
- **[Countdown-Code](https://aclanthology.org/2026.emnlp-main.1902/)**（主会）
  o4-mini から蒸留した SFT データのうち、約1.2%は「テストは通るが中身は不正」な軌跡でした。これだけで RLVR 後のモデルの不正率は96.3%に達し、その大半は `test.py` の書き換えでした。不正の傾向は HumanEval にも転移しています。SFT の前に不正な軌跡を取り除くと、不正はほぼ起きませんでした。
- **[BAITBENCH](https://aclanthology.org/2026.findings-emnlp.2477/)**（Findings）
  ML タスクに、データ漏洩を使った「近道」をあらかじめ仕込んでおくベンチマークです。7種類のエージェントの全実行のうち57.1%が近道を使い、不正をした実行の92.4%は近道だと気づいたうえで使っていました。「不正をしないように」と指示しても、不正率は6.2ポイントしか下がりません。
- **[When Surprise Is Not Enough](https://aclanthology.org/2026.emnlp-main.245/)**（主会）
  科学的発見を目指すエージェントでも同じ構図があります。ベイズ的な「驚き」を報酬にすると、探索がノイズやデータのリークに引き寄せられてしまいます（いわゆる noisy-TV 問題）。統計的な検証を組み込んだ報酬に替えると、この問題が抑えられました。

> 検証器は「精度」だけでなく、「攻略されにくさ」で評価する必要があります。

### 検証器は「より安く」「過程まで」見る方向へ

一方で、検証器そのものを改良する研究も増えています。

| 方向 | 論文 | 要点 |
|---|---|---|
| 環境なしで検証 | [Dockerless](https://aclanthology.org/2026.emnlp-main.640/)（主会） | 読み取り専用のサブエージェントがリポジトリから証拠を集めて判定する。これを報酬にした RL と、Docker で実際にテストを実行する RL との差は最大1.3ポイント |
| 過程を検証 | [Agentic Rubrics](https://aclanthology.org/2026.emnlp-main.2690/)（主会） | 実行可能なルーブリックで、最終状態だけでは見えない過程の誤りを検出する。誤りの検出率は32.9%（従来のチェックリストは10.7%） |
| ラベルなしで検証 | [Faithful Autoformalization](https://aclanthology.org/2026.findings-emnlp.469/)（Findings） | 形式化 → 逆翻訳 → 再形式化を行い、SMT ソルバーで等価性を判定する。等価率は44.7%から85.3%に向上 |
| 定理ごとの検証器 | [Counterexample Generation](https://aclanthology.org/2026.findings-emnlp.2112/)（Findings） | 4,707件の偽の命題それぞれに専用の記号検証器を付け、反例生成を学習する。SFT だけでは真の定理を見分けられなくなり（0.27 → 0.00）、疎な報酬の RL で回復した（0.65） |

ただし代償もあります。Dockerless は正解パッチの存在を前提としており、1回の判定に約180秒かかります（テストの実行は約83秒）。Faithful Autoformalization の人手監査では、不合格とされたルール11件のうち8件が、実際には正しく形式化されていました。

## 知見2：探索の枠組みは汎用化し、差は「計算資源の配分」で決まる

- **[CodeEvolve](https://aclanthology.org/2026.findings-emnlp.1345/)**（Findings）
  オープンソースの AlphaEvolve 型フレームワークです（island 型の遺伝的アルゴリズム、MAP-Elites、プロンプトの共進化）。9問中5問で AlphaEvolve の報告値に並ぶか上回りました。たとえば円詰め込み問題（n=26）では、オープンモデルの Qwen3-Coder-30B で 2.63598 を達成し、AlphaEvolve の 2.63586 を上回っています。
- **[Test-Time Scaling for Scientific Equation Discovery](https://aclanthology.org/2026.emnlp-main.354/)**（主会）
  検証器が信頼できる状況では、最も効くのは探索の「幅」でした。最適な幅は予算とともに大きくなり、island の構成や探索手法の違いの影響は相対的に小さいという結果です。ある設定では、幅を1から32に広げると実行時間が7,622秒から1,586秒へ約80%短くなり、精度も 0.965 から 0.984 へ上がりました。
- **[Compute Allocation in Evolutionary Search](https://aclanthology.org/2026.emnlp-main.1056/)**（主会）
  同じ設定で進化的探索を繰り返しても、実行ごとの結果は大きくばらつきます。そこで予算を10本の並列探索に分け、バンディットで有望な探索に追加の予算を回すと、最も強い island 型のベースラインより平均 fitness が12.3%高くなりました。
- **[Controlled Self-Evolution](https://aclanthology.org/2026.findings-emnlp.1036/)**（Findings）
  多様な計画からの出発、モジュール単位の変異と交叉、成功と失敗の記憶を組み合わせて、コードの効率化を進化的に探索します。GPT-5 を使った場合の指標（MI）は 67.47 で、AlphaEvolve の 63.04 を上回りました。
- **[From AI Assistant to AI Scientist](https://aclanthology.org/2026.findings-emnlp.2446/)**（Findings）
  探索の対象は、アルゴリズムそのものにも広がっています。この研究では、エージェントが GRPO の変種を閉ループで探索し、64個のアルゴリズムを約5,500 GPU 時間かけて評価しました。見つかった変種は、AIME25 の pass@32 を 26.7 から 43.3 に引き上げています。

> 探索アルゴリズムそのものは、もはや差別化の要因になりにくくなっています。実行ごとのばらつきが大きいため、並列化と予算配分が効いてきます。そしてその前提には、信頼できる検証器があります。

## 知見3：経験は「貯める」から「関門を設けて更新する」へ

### 蓄積の形：重みではなく、編集できるテキストやコード

- **[Trace2Skill](https://aclanthology.org/2026.emnlp-main.758/)**（主会）：軌跡ごとに得た教訓を並列に統合して、1つの `SKILL.md` にまとめます。SpreadsheetBench で 48.33 から 69.83 に向上しました。
- **[HarnessForge](https://aclanthology.org/2026.emnlp-main.1893/)**（主会）：エージェントのハーネス（計画・行動・記憶のコード）と LoRA で適応させた方策を、交互に進化させます。
- **[Skill-as-Pseudocode](https://aclanthology.org/2026.findings-emnlp.889/)**（Findings）：散文で書かれたスキルを、型付きの契約と、環境が受け付ける行動テンプレートに変換します。ALFWorld では402ゲーム中82勝（比較手法は47勝）でした。
- **[MetaGen](https://aclanthology.org/2026.findings-emnlp.2005/)**（Findings）：マルチエージェントの役割と接続構造を、学習なしで自己進化させます。比較手法よりトークン消費を85〜91%減らしています。

### 新しい焦点：更新に関門（ゲート）を設ける

- **[RepairGate](https://aclanthology.org/2026.findings-emnlp.648/)**（Findings）：スキルライブラリへの修正案を適用するかどうかを、RL で学習した 9B のモデルが判断します。6種類のエージェントの平均で、何もしない場合より7.73ポイント向上しました。
- **[MemGuard](https://aclanthology.org/2026.emnlp-main.423/)**（主会）：検証器の出力を記憶のメタデータとして残し、記憶の登録・検索・破棄の判断に使います。WebArena では ReasoningBank より最大7.9ポイント高い成功率でした。
- **[OptiSkill](https://aclanthology.org/2026.emnlp-main.1316/)**（主会）：ソルバーで検証済みの軌跡から、32の問題レベルの戦略と87の局所的なルールを抽出し、更新の前には回帰チェックを行います。

ただし、長期的に経験を活かす能力はまだ発展途上です。生涯学習ベンチマークの [StuLife](https://aclanthology.org/2026.findings-emnlp.770/)（Findings）では、最も良かった GPT-5 のスコアが 17.90 で、人間の 85.24 に遠く及びませんでした。

> 経験ライブラリにも検証器が必要です。これは知見1と同じ構図です。

## 知見4：分野をまたいで見えた「表層は解けても、深層は解けない」

| 論文 | できること | できないこと |
|---|---|---|
| [Kernel Exploit Generation](https://aclanthology.org/2026.emnlp-main.1653/)（主会） | カーネルをクラッシュさせる | 指定された攻撃プリミティブの構築（参照 PoC なしの場合、Linux 14/25、Windows 1/20） |
| [Linux Kernel Fault Localization](https://aclanthology.org/2026.emnlp-main.2201/)（主会） | 怪しい関数を挙げる（Top-5 で80.5%） | 根本原因の特定（Top-1 で53.5%）と、その伝播経路の説明 |
| [CyberChainBench](https://aclanthology.org/2026.findings-emnlp.1343/)（Findings） | 攻撃を止めるパッチを書く（Gemini：阻止率98.9%） | 正常な取引も通すパッチを書く（同：1.1%） |
| [How LLMs Fail and Generalize in RTL Coding](https://aclanthology.org/2026.emnlp-industry.29/)（Industry） | 構文エラーを減らす | 機能的な誤りを減らす（SFT や RL は、誤りを構文の段階から機能の段階へ移すだけ） |
| [VEX-Bench](https://aclanthology.org/2026.emnlp-main.2615/)（主会） | 脆弱性の影響の有無を判定する（正解率89.3%） | 「影響なし」の理由づけ（macro-F1 73.5%） |

分野はばらばらですが、どれも「表面的な目標は達成できるが、本当に求められている深い目標には届かない」という同じ構図です。こうしたギャップは、決定的な検証器を備えたベンチマークだからこそ、はっきり測れます。検証可能な分野に取り組む価値は、ここにあると考えています。

### 数学・カーネル・チップでは、検証信号を細かく使う

各分野の手法を見ると、証明器・コンパイラ・テストベンチの「合格／不合格」をそのまま使うのではなく、細かく分解して学習や探索に活かす工夫が目立ちました。

- **定理証明**：[Learning to Explore the Crux](https://aclanthology.org/2026.emnlp-main.1932/)（主会）は、高エントロピーのトークンから証明の要所を見つけ、そこへ優先的にバックトラックします（MiniF2F 81.8%）。[ProofFrontier](https://aclanthology.org/2026.findings-emnlp.1615/)（Findings）は、検証済みの証明の一部を隠して「解けるか解けないかの境界」にある課題を作り、わずか500題の RL で miniF2F を4.92ポイント改善しました。[HybridProver](https://aclanthology.org/2026.findings-emnlp.1529/)（Findings）は、失敗した証明をスケッチとして再利用します（Isabelle の miniF2F で73.8%）。
- **カーネル最適化**：[LLM4LLM](https://aclanthology.org/2026.emnlp-main.859/)（主会）は、実際の推論スクリプトで性能を測りながら閉ループで最適化します（eager PyTorch 比で A100 では3.91倍、H100 では6.98倍）。[HTAM](https://aclanthology.org/2026.emnlp-main.531/)（主会）は最適化の「方向」の間の遷移を記憶し、KernelBench の Fast@1 を84.0%にしました（単純な記憶検索では58.8%）。[AMDKernelVault](https://aclanthology.org/2026.findings-emnlp.1493/)（Findings）は、AMD の GPU 上で実行検証済みの HIP カーネル約6.2万件と Triton カーネル約4万件を公開しています。
- **チップ設計**：[CirCA](https://aclanthology.org/2026.emnlp-main.1450/)（主会）は、回路の原子的な論理ブロックの単位で報酬を割り当てる RL で、7B のモデルながら RTLLM-v1 で70.5%を達成しました。

## 全体像：生成 → 検証 → 探索 → 蓄積のループ

4つの知見を1枚にまとめると、次のようなループになります。

<ol class="loop">
  <li><strong>生成</strong>LLM・エージェント。スキル・ハーネス・役割を編集できる形で持つ（知見3）</li>
  <li class="key"><strong>検証</strong>攻略されにくさ・コスト・過程の検証が論点（知見1）。深層のギャップも暴く（知見4）</li>
  <li><strong>探索</strong>幅・並列数・バンディットによる計算資源の配分（知見2）</li>
  <li><strong>蓄積</strong>経験ライブラリ。更新にも関門、つまりここにも検証器（知見3）</li>
</ol>
<p class="loop-note">蓄積した経験は次の生成に戻り、ループが回る</p>

このループの上限を決めているのは検証器です。検証器が攻略されれば、探索の結果も、蓄積される経験も汚染されてしまいます。私自身の研究テーマである「検証器をループの外から中へ」も、この流れの上にあると考えています。

## 考えたい問い

最後に、これから考えていきたい問いを挙げておきます。

1. **検証器をどう定義するか？** 検証器が「攻略された」とはどういう状態か。そして、攻略されないことをどう確かめるか。
2. **スキルや経験の蓄積にも検証器が必要だとしたら、それをどう検証すればよいか？**
3. **検証のコストが低く、結果が確定する問題は、ほかに何があるか？** 数学、カーネル、チップ、スマートコントラクトのほかに、どんな候補分野があるか。

## 付録：精読した36本の一覧

**進化的探索の枠組み**

| 論文 | 区分 |
|---|---|
| [Compute Allocation in Evolutionary Search](https://aclanthology.org/2026.emnlp-main.1056/) | 主会 |
| [When Surprise Is Not Enough](https://aclanthology.org/2026.emnlp-main.245/) | 主会 |
| [Test-Time Scaling for Scientific Equation Discovery](https://aclanthology.org/2026.emnlp-main.354/) | 主会 |
| [CodeEvolve](https://aclanthology.org/2026.findings-emnlp.1345/) | Findings |
| [Controlled Self-Evolution for Algorithmic Code Optimization](https://aclanthology.org/2026.findings-emnlp.1036/) | Findings |
| [FormalEvolve](https://aclanthology.org/2026.findings-emnlp.317/) | Findings |
| [From AI Assistant to AI Scientist](https://aclanthology.org/2026.findings-emnlp.2446/) | Findings |

**検証器と報酬ハッキング**

| 論文 | 区分 |
|---|---|
| [Countdown-Code](https://aclanthology.org/2026.emnlp-main.1902/) | 主会 |
| [From Accuracy to Robustness](https://aclanthology.org/2026.emnlp-main.255/) | 主会 |
| [Dockerless](https://aclanthology.org/2026.emnlp-main.640/) | 主会 |
| [Agentic Rubrics](https://aclanthology.org/2026.emnlp-main.2690/) | 主会 |
| [MemGuard](https://aclanthology.org/2026.emnlp-main.423/) | 主会 |
| [BAITBENCH](https://aclanthology.org/2026.findings-emnlp.2477/) | Findings |
| [Counterexample Generation via Per-Theorem Symbolic Verifiers](https://aclanthology.org/2026.findings-emnlp.2112/) | Findings |
| [Faithful Autoformalization via Roundtrip Verification and Repair](https://aclanthology.org/2026.findings-emnlp.469/) | Findings |

**集団進化と経験の蓄積**

| 論文 | 区分 |
|---|---|
| [Trace2Skill](https://aclanthology.org/2026.emnlp-main.758/) | 主会 |
| [HarnessForge](https://aclanthology.org/2026.emnlp-main.1893/) | 主会 |
| [OptiSkill](https://aclanthology.org/2026.emnlp-main.1316/) | 主会 |
| [MetaGen](https://aclanthology.org/2026.findings-emnlp.2005/) | Findings |
| [Skill-as-Pseudocode](https://aclanthology.org/2026.findings-emnlp.889/) | Findings |
| [RepairGate](https://aclanthology.org/2026.findings-emnlp.648/) | Findings |
| [A Benchmark for Self-Evolving Agents via Experience-Driven Lifelong Learning（StuLife）](https://aclanthology.org/2026.findings-emnlp.770/) | Findings |

**各分野への応用**

| 論文 | 分野 | 区分 |
|---|---|---|
| [Evaluating Coding Agents on Kernel Exploit Generation](https://aclanthology.org/2026.emnlp-main.1653/) | セキュリティ | 主会 |
| [VEX-Bench](https://aclanthology.org/2026.emnlp-main.2615/) | セキュリティ | 主会 |
| [Code Agents Don't Understand Root Cause](https://aclanthology.org/2026.emnlp-main.2201/) | セキュリティ | 主会 |
| [CyberChainBench](https://aclanthology.org/2026.findings-emnlp.1343/) | セキュリティ | Findings |
| [Learning to Explore the Crux in Formal Theorem Proving](https://aclanthology.org/2026.emnlp-main.1932/) | 数学 | 主会 |
| [ProofFrontier](https://aclanthology.org/2026.findings-emnlp.1615/) | 数学 | Findings |
| [HybridProver](https://aclanthology.org/2026.findings-emnlp.1529/) | 数学 | Findings |
| [Compiler-Guided Adaptive Proof Search](https://aclanthology.org/2026.findings-emnlp.669/) | 数学 | Findings |
| [LLM4LLM](https://aclanthology.org/2026.emnlp-main.859/) | カーネル最適化 | 主会 |
| [GLARE](https://aclanthology.org/2026.emnlp-main.1870/) | カーネル最適化 | 主会 |
| [HTAM](https://aclanthology.org/2026.emnlp-main.531/) | カーネル最適化 | 主会 |
| [AMDKernelVault](https://aclanthology.org/2026.findings-emnlp.1493/) | カーネル最適化 | Findings |
| [CirCA](https://aclanthology.org/2026.emnlp-main.1450/) | チップ設計 | 主会 |
| [How LLMs Fail and Generalize in RTL Coding for Hardware Design?](https://aclanthology.org/2026.emnlp-industry.29/) | チップ設計 | Industry |

記事中の数値は、すべて各論文の本文・表から引用しています。誤りがあればご指摘いただけると助かります。


## 会場の様子

今回はオンライン参加でしたが、最後に会場の雰囲気が伝わる写真を何枚か載せておきます。

<div class="photos">
<figure class="wide"><img src="/posts/emnlp-2026-insights/01-entrance.jpg" alt="HUNGEXPO の建物の前に立つ EMNLP 2026 の歓迎看板" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>会場の HUNGEXPO（ブダペスト）</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/02-banner.jpg" alt="EMNLP 2026 Budapest October 24–29 と書かれた入口のバナー" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>入口のバナー</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/03-hall.jpg" alt="満席の大ホールで講演を聴く参加者たち" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>満席の大ホール</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/04-lobby.jpg" alt="休憩時間に参加者で混み合うロビーとエスカレーター" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>休憩時間のロビー</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/05-dance.jpg" alt="民族衣装のダンサーと、輪になって手拍子する参加者たち" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>会場での民族舞踊のパフォーマンス</figcaption></figure>
</div>

<p class="photo-credit">写真：EMNLP 2026 公式フォトギャラリーより転載</p>