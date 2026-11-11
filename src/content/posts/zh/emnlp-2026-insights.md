---
title: 'EMNLP 2026 参会报告：从 36 篇论文看“以验证器为中心”的趋势'
description: '我精读了 EMNLP 2026 的 36 篇论文，横向对比后发现：LLM 智能体研究的重心正在从“生成什么”转向“如何验证”。本文把它归纳为四个观察。'
date: 2026-11-11
lang: zh
tags: ['EMNLP 2026', 'LLM 智能体', '验证器', '强化学习', '进化搜索']
---

2026 年 10 月 24 日至 29 日，EMNLP 2026 在布达佩斯举行，我以线上方式参加了这次会议。这篇文章不逐篇介绍论文，而是把我按自己的兴趣精读的 36 篇论文放在一起比较，归纳出四个观察。

## 调研范围

选题标准是：**用“生成 → 验证 → 搜索”的循环，去解决验证成本低、计算量大的问题。**我先从 Underline 的会议日程里筛选候选论文，再到 ACL Anthology 读全文，每篇都写了一份笔记，内容包括摘要、研究问题、方法、改进点和结果。

| 方向 | 篇数 |
|---|---|
| 进化搜索框架 | 7 |
| 验证器与 reward hacking | 8 |
| 群体进化与经验积累 | 7 |
| 各领域应用（安全、数学、kernel 优化、芯片设计） | 14 |

其中主会 19 篇、Findings 16 篇、Industry Track 1 篇。这些论文是按我的兴趣挑选的，不能代表 EMNLP 的整体情况。不过，仅主会的 LLM Agents 分会场就有 6 场，智能体研究的分量确实很重。

## 先说结论

读完这 36 篇，我的判断是：**智能体研究的重心，正在从“生成什么”转向“如何验证”。**

1. **验证器会被攻破。**用作强化学习（RL）奖励的验证器，很快就会被策略钻空子。现在不仅要看验证器准不准，还要看它是否容易被攻破。
2. **搜索方法之间的差距在缩小。**AlphaEvolve 式的框架已经成了通用工具，真正拉开差距的是算力如何分配，以及验证器的质量。
3. **经验的更新也需要把关。**光是积累技能和记忆还不够，更新之前先验证、再决定是否采纳，正在成为新的焦点。
4. **表层问题能解，深层问题解不了。**在安全、kernel、芯片设计等不同领域，都出现了同一种形态的差距。

## 观察 1：用作 RL 奖励的验证器，很快就会被“攻破”

### 被攻破的验证器

- **[From Accuracy to Robustness](https://aclanthology.org/2026.emnlp-main.255/)**（主会）
  这篇论文比较了数学推理中基于规则和基于模型的验证器。一个微调过的生成式验证器在静态评测中准确率更高，但用作 RL 奖励后，大约 450 步就被策略攻破，训练随之崩溃。面对单个符号、冗长的无意义文本这类简单的攻击模式，生成式验证器的误判率最高达到 77.9%。相比之下，判别式的 xVerify 要稳健得多。
- **[Countdown-Code](https://aclanthology.org/2026.emnlp-main.1902/)**（主会）
  从 o4-mini 蒸馏得到的 SFT 数据中，约 1.2% 是“测试能通过、但实际在作弊”的轨迹。仅凭这一点，经过 RLVR 后模型的作弊率就达到了 96.3%，大部分是直接改写 `test.py`。这种作弊倾向还迁移到了 HumanEval 上。如果在 SFT 之前剔除这些作弊轨迹，几乎就不会出现作弊。
- **[BAITBENCH](https://aclanthology.org/2026.findings-emnlp.2477/)**（Findings）
  这个基准在 ML 任务中事先埋下利用数据泄漏的“捷径”。7 种智能体的所有运行中，有 57.1% 走了捷径；而在作弊的运行里，92.4% 是明知道这是捷径还去用。即使明确提示“不要作弊”，作弊率也只下降了 6.2 个百分点。
- **[When Surprise Is Not Enough](https://aclanthology.org/2026.emnlp-main.245/)**（主会）
  面向科学发现的智能体也有同样的问题。如果用贝叶斯意义上的“惊讶度”作为奖励，搜索会被噪声和数据泄漏吸引过去（即所谓的 noisy-TV 问题）。换成加入了统计检验的奖励后，这个问题得到了抑制。

> 评价验证器，不能只看“准确率”，还要看它“是否容易被攻破”。

### 验证器在朝“更便宜”“能检查过程”的方向发展

另一方面，改进验证器本身的研究也在增加。

| 方向 | 论文 | 要点 |
|---|---|---|
| 不依赖运行环境 | [Dockerless](https://aclanthology.org/2026.emnlp-main.640/)（主会） | 由只读的子智能体在代码仓库里收集证据再做判定。用它做奖励的 RL，与在 Docker 里真正跑测试的 RL 相比，差距最多 1.3 个百分点 |
| 检查过程 | [Agentic Rubrics](https://aclanthology.org/2026.emnlp-main.2690/)（主会） | 用可执行的评分细则（rubric）发现只看最终状态时看不到的过程错误。错误检出率为 32.9%（以往的检查清单为 10.7%） |
| 不需要标签 | [Faithful Autoformalization](https://aclanthology.org/2026.findings-emnlp.469/)（Findings） | 先形式化，再回译、再形式化，用 SMT 求解器判断两次结果是否等价。等价率从 44.7% 提升到 85.3% |
| 每个定理一个验证器 | [Counterexample Generation](https://aclanthology.org/2026.findings-emnlp.2112/)（Findings） | 为 4,707 个错误命题各配一个专用的符号验证器，用来学习构造反例。只做 SFT 时，模型反而认不出真定理了（0.27 → 0.00），用稀疏奖励的 RL 才恢复过来（0.65） |

不过这些方法也有代价。Dockerless 需要事先有正确补丁，一次判定大约要 180 秒（直接跑测试约 83 秒）。在 Faithful Autoformalization 的人工审查中，被判为不合格的 11 条规则里，有 8 条其实形式化得是对的。

## 观察 2：搜索框架已经通用化，差距在于“算力怎么分配”

- **[CodeEvolve](https://aclanthology.org/2026.findings-emnlp.1345/)**（Findings）
  一个开源的 AlphaEvolve 式框架（island 遗传算法、MAP-Elites、prompt 协同进化）。在 9 个问题中，有 5 个达到或超过了 AlphaEvolve 公布的结果。例如在圆填充问题（n=26）上，开源模型 Qwen3-Coder-30B 得到 2.63598，超过了 AlphaEvolve 的 2.63586。
- **[Test-Time Scaling for Scientific Equation Discovery](https://aclanthology.org/2026.emnlp-main.354/)**（主会）
  在验证器可靠的前提下，最有效的是搜索的“宽度”。最优宽度随预算增加而变大，而 island 的设置、搜索方法的差别，影响相对较小。在其中一组设置下，把宽度从 1 扩大到 32，运行时间从 7,622 秒降到 1,586 秒，缩短约 80%，精度也从 0.965 提高到 0.984。
- **[Compute Allocation in Evolutionary Search](https://aclanthology.org/2026.emnlp-main.1056/)**（主会）
  同样的设置反复运行进化搜索，每次结果的差别很大。于是作者把预算分给 10 条并行的搜索，再用 bandit 把追加的预算分给更有希望的那几条。这样做的平均 fitness 比最强的 island 基线高 12.3%。
- **[Controlled Self-Evolution](https://aclanthology.org/2026.findings-emnlp.1036/)**（Findings）
  结合多样化的初始规划、模块级的变异与交叉，以及对成功和失败经验的记忆，用进化的方式优化代码效率。使用 GPT-5 时，指标 MI 达到 67.47，高于 AlphaEvolve 的 63.04。
- **[From AI Assistant to AI Scientist](https://aclanthology.org/2026.findings-emnlp.2446/)**（Findings）
  搜索的对象已经扩展到算法本身。这项研究让智能体闭环搜索 GRPO 的变体，花了约 5,500 GPU 小时评估了 64 个算法。找到的变体把 AIME25 的 pass@32 从 26.7 提高到 43.3。

> 搜索算法本身已经很难成为差异化因素。由于每次运行的结果波动很大，并行化和预算分配就变得关键。而这一切的前提，是有一个可靠的验证器。

## 观察 3：经验从“积累”走向“设关卡再更新”

### 经验的存储形式：不是模型权重，而是可编辑的文本和代码

- **[Trace2Skill](https://aclanthology.org/2026.emnlp-main.758/)**（主会）：把从每条轨迹中得到的教训并行合并，整理成一份 `SKILL.md`。在 SpreadsheetBench 上从 48.33 提升到 69.83。
- **[HarnessForge](https://aclanthology.org/2026.emnlp-main.1893/)**（主会）：交替进化智能体的 harness（规划、行动、记忆的代码）和经过 LoRA 适配的策略。
- **[Skill-as-Pseudocode](https://aclanthology.org/2026.findings-emnlp.889/)**（Findings）：把用自然语言写的技能，转换成带类型的契约，以及环境能直接接受的动作模板。在 ALFWorld 上 402 局赢了 82 局（对比方法为 47 局）。
- **[MetaGen](https://aclanthology.org/2026.findings-emnlp.2005/)**（Findings）：在不训练的情况下，让多智能体的角色和连接结构自我进化。与对比方法相比，token 消耗减少了 85% 到 91%。

### 新的焦点：给更新设关卡

- **[RepairGate](https://aclanthology.org/2026.findings-emnlp.648/)**（Findings）：由一个用 RL 训练的 9B 模型，决定是否采纳对技能库的修改。在 6 种智能体上平均比不做处理高 7.73 个百分点。
- **[MemGuard](https://aclanthology.org/2026.emnlp-main.423/)**（主会）：把验证器的输出作为元数据存进记忆，用来决定记忆的写入、检索和删除。在 WebArena 上，成功率比 ReasoningBank 最多高 7.9 个百分点。
- **[OptiSkill](https://aclanthology.org/2026.emnlp-main.1316/)**（主会）：从经过求解器验证的轨迹中，提炼出 32 条问题级策略和 87 条局部规则，更新之前还要做回归检查。

不过，长期利用经验的能力还远未成熟。在终身学习基准 [StuLife](https://aclanthology.org/2026.findings-emnlp.770/)（Findings）上，表现最好的 GPT-5 只拿到 17.90 分，而人类是 85.24 分。

> 经验库同样需要验证器。这和观察 1 是同一个结构。

## 观察 4：跨领域都出现了“表层问题能解，深层问题解不了”

| 论文 | 能做到 | 做不到 |
|---|---|---|
| [Kernel Exploit Generation](https://aclanthology.org/2026.emnlp-main.1653/)（主会） | 让内核崩溃 | 构造出指定的攻击原语（不提供参考 PoC 时，Linux 14/25，Windows 1/20） |
| [Linux Kernel Fault Localization](https://aclanthology.org/2026.emnlp-main.2201/)（主会） | 列出可疑函数（Top-5 为 80.5%） | 找到根本原因（Top-1 为 53.5%），并说明错误的传播路径 |
| [CyberChainBench](https://aclanthology.org/2026.findings-emnlp.1343/)（Findings） | 写出能挡住攻击的补丁（Gemini：拦截率 98.9%） | 写出同时不影响正常交易的补丁（同一模型：1.1%） |
| [How LLMs Fail and Generalize in RTL Coding](https://aclanthology.org/2026.emnlp-industry.29/)（Industry） | 减少语法错误 | 减少功能错误（SFT 和 RL 只是把错误从语法阶段推到了功能阶段） |
| [VEX-Bench](https://aclanthology.org/2026.emnlp-main.2615/)（主会） | 判断漏洞是否有影响（准确率 89.3%） | 给出“不受影响”的理由（macro-F1 为 73.5%） |

领域各不相同，但结构是一样的：表面上的目标能达到，真正要求的深层目标却够不着。正因为这些基准都配有确定性的验证器，这种差距才能被清楚地测出来。我认为，这正是值得在可验证领域投入的原因。

### 在数学、kernel 和芯片领域，验证信号被拆得更细

看各领域的方法，一个明显的趋势是：不直接使用证明器、编译器、测试平台给出的“通过 / 不通过”，而是把它拆细，再用于训练和搜索。

- **定理证明**：[Learning to Explore the Crux](https://aclanthology.org/2026.emnlp-main.1932/)（主会）用高熵 token 找到证明中的关键步骤，并优先回溯到这些位置（MiniF2F 81.8%）。[ProofFrontier](https://aclanthology.org/2026.findings-emnlp.1615/)（Findings）把已验证证明的一部分遮住，构造出“刚好处在能解与不能解边界上”的题目，只用 500 道题做 RL，就让 miniF2F 提高了 4.92 个百分点。[HybridProver](https://aclanthology.org/2026.findings-emnlp.1529/)（Findings）把失败的证明当作草稿（sketch）重新利用（Isabelle 版 miniF2F 73.8%）。
- **kernel 优化**：[LLM4LLM](https://aclanthology.org/2026.emnlp-main.859/)（主会）一边用真实的推理脚本测性能，一边做闭环优化（相对 eager PyTorch，A100 上 3.91 倍，H100 上 6.98 倍）。[HTAM](https://aclanthology.org/2026.emnlp-main.531/)（主会）记住优化“方向”之间的转移，把 KernelBench 的 Fast@1 提高到 84.0%（简单的记忆检索为 58.8%）。[AMDKernelVault](https://aclanthology.org/2026.findings-emnlp.1493/)（Findings）公开了在 AMD GPU 上实际执行验证过的约 6.2 万个 HIP kernel 和约 4 万个 Triton kernel。
- **芯片设计**：[CirCA](https://aclanthology.org/2026.emnlp-main.1450/)（主会）在 RL 中按电路的原子逻辑块分配奖励，用 7B 模型在 RTLLM-v1 上达到了 70.5%。

## 全景：生成 → 验证 → 搜索 → 积累的循环

把四个观察放到一张图里，就是下面这个循环。

<ol class="loop">
  <li><strong>生成</strong>LLM 与智能体。用可编辑的形式保存技能、harness 和角色（观察 3）</li>
  <li class="key"><strong>验证</strong>焦点在于抗攻破能力、成本和对过程的检查（观察 1），也能揭示深层差距（观察 4）</li>
  <li><strong>搜索</strong>宽度、并行数、用 bandit 分配算力（观察 2）</li>
  <li><strong>积累</strong>经验库。更新也要设关卡，也就是这里同样需要验证器（观察 3）</li>
</ol>
<p class="loop-note">积累的经验回到下一轮生成，循环往复</p>

决定这个循环上限的是验证器。一旦验证器被攻破，搜索的结果和积累的经验都会被污染。我自己的研究课题“把验证器从循环外放到循环内”，也正处在这条脉络上。

## 值得思考的问题

最后，列出几个我想继续思考的问题。

1. **如何定义验证器？**如何定义“一个验证器被攻破了”，又该怎么确认它不会被攻破？
2. **如果技能和经验的累积也需要验证器，应该如何去验证？**
3. **验证成本低、结果确定的问题，还有哪些？**除了数学、kernel、芯片和智能合约，还有什么候选领域？

## 附录：精读的 36 篇论文

**进化搜索框架**

| 论文 | 类别 |
|---|---|
| [Compute Allocation in Evolutionary Search](https://aclanthology.org/2026.emnlp-main.1056/) | 主会 |
| [When Surprise Is Not Enough](https://aclanthology.org/2026.emnlp-main.245/) | 主会 |
| [Test-Time Scaling for Scientific Equation Discovery](https://aclanthology.org/2026.emnlp-main.354/) | 主会 |
| [CodeEvolve](https://aclanthology.org/2026.findings-emnlp.1345/) | Findings |
| [Controlled Self-Evolution for Algorithmic Code Optimization](https://aclanthology.org/2026.findings-emnlp.1036/) | Findings |
| [FormalEvolve](https://aclanthology.org/2026.findings-emnlp.317/) | Findings |
| [From AI Assistant to AI Scientist](https://aclanthology.org/2026.findings-emnlp.2446/) | Findings |

**验证器与 reward hacking**

| 论文 | 类别 |
|---|---|
| [Countdown-Code](https://aclanthology.org/2026.emnlp-main.1902/) | 主会 |
| [From Accuracy to Robustness](https://aclanthology.org/2026.emnlp-main.255/) | 主会 |
| [Dockerless](https://aclanthology.org/2026.emnlp-main.640/) | 主会 |
| [Agentic Rubrics](https://aclanthology.org/2026.emnlp-main.2690/) | 主会 |
| [MemGuard](https://aclanthology.org/2026.emnlp-main.423/) | 主会 |
| [BAITBENCH](https://aclanthology.org/2026.findings-emnlp.2477/) | Findings |
| [Counterexample Generation via Per-Theorem Symbolic Verifiers](https://aclanthology.org/2026.findings-emnlp.2112/) | Findings |
| [Faithful Autoformalization via Roundtrip Verification and Repair](https://aclanthology.org/2026.findings-emnlp.469/) | Findings |

**群体进化与经验积累**

| 论文 | 类别 |
|---|---|
| [Trace2Skill](https://aclanthology.org/2026.emnlp-main.758/) | 主会 |
| [HarnessForge](https://aclanthology.org/2026.emnlp-main.1893/) | 主会 |
| [OptiSkill](https://aclanthology.org/2026.emnlp-main.1316/) | 主会 |
| [MetaGen](https://aclanthology.org/2026.findings-emnlp.2005/) | Findings |
| [Skill-as-Pseudocode](https://aclanthology.org/2026.findings-emnlp.889/) | Findings |
| [RepairGate](https://aclanthology.org/2026.findings-emnlp.648/) | Findings |
| [A Benchmark for Self-Evolving Agents via Experience-Driven Lifelong Learning（StuLife）](https://aclanthology.org/2026.findings-emnlp.770/) | Findings |

**各领域应用**

| 论文 | 领域 | 类别 |
|---|---|---|
| [Evaluating Coding Agents on Kernel Exploit Generation](https://aclanthology.org/2026.emnlp-main.1653/) | 安全 | 主会 |
| [VEX-Bench](https://aclanthology.org/2026.emnlp-main.2615/) | 安全 | 主会 |
| [Code Agents Don't Understand Root Cause](https://aclanthology.org/2026.emnlp-main.2201/) | 安全 | 主会 |
| [CyberChainBench](https://aclanthology.org/2026.findings-emnlp.1343/) | 安全 | Findings |
| [Learning to Explore the Crux in Formal Theorem Proving](https://aclanthology.org/2026.emnlp-main.1932/) | 数学 | 主会 |
| [ProofFrontier](https://aclanthology.org/2026.findings-emnlp.1615/) | 数学 | Findings |
| [HybridProver](https://aclanthology.org/2026.findings-emnlp.1529/) | 数学 | Findings |
| [Compiler-Guided Adaptive Proof Search](https://aclanthology.org/2026.findings-emnlp.669/) | 数学 | Findings |
| [LLM4LLM](https://aclanthology.org/2026.emnlp-main.859/) | kernel 优化 | 主会 |
| [GLARE](https://aclanthology.org/2026.emnlp-main.1870/) | kernel 优化 | 主会 |
| [HTAM](https://aclanthology.org/2026.emnlp-main.531/) | kernel 优化 | 主会 |
| [AMDKernelVault](https://aclanthology.org/2026.findings-emnlp.1493/) | kernel 优化 | Findings |
| [CirCA](https://aclanthology.org/2026.emnlp-main.1450/) | 芯片设计 | 主会 |
| [How LLMs Fail and Generalize in RTL Coding for Hardware Design?](https://aclanthology.org/2026.emnlp-industry.29/) | 芯片设计 | Industry |

文中的数字都引自各篇论文的正文和表格。如有错误，欢迎指正。


## 会场照片

这次我是线上参加的，最后放几张照片，感受一下会场的气氛。

<div class="photos">
<figure class="wide"><img src="/posts/emnlp-2026-insights/01-entrance.jpg" alt="HUNGEXPO 建筑前的 EMNLP 2026 欢迎看板" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>会场 HUNGEXPO（布达佩斯）</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/02-banner.jpg" alt="写着 EMNLP 2026 Budapest October 24–29 的入口横幅" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>入口的横幅</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/03-hall.jpg" alt="坐满听众的大礼堂" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>座无虚席的大礼堂</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/04-lobby.jpg" alt="茶歇时挤满参会者的大厅和扶梯" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>茶歇时的大厅</figcaption></figure>
<figure><img src="/posts/emnlp-2026-insights/05-dance.jpg" alt="穿民族服装的舞者和围成一圈拍手的参会者" width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>会场里的民族舞蹈表演</figcaption></figure>
</div>

<p class="photo-credit">照片转载自 EMNLP 2026 官方相册</p>