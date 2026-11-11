// ============================================================================
// All editable content of the homepage lives in this file.
// Every text has a Japanese, English and Chinese version.
// ============================================================================

export const LANGS = ['ja', 'en', 'zh'] as const;
export type Lang = (typeof LANGS)[number];
/** A piece of text in every supported language. */
export type T = Record<Lang, string>;
/** Language names as shown in the language switcher. */
export const LANG_NAMES: T = { ja: '日本語', en: 'English', zh: '中文' };
/** BCP 47 tags for <html lang> and hreflang. */
export const LANG_TAGS: T = { ja: 'ja', en: 'en', zh: 'zh-CN' };

export const GITHUB_USER = 'ForeverMJ';
/** Repos with this topic are picked up automatically at build time. */
export const SHOWCASE_TOPIC = 'showcase';

export const profile = {
  name: { ja: '陶 澤文', en: 'Zewen Tao', zh: '陶泽文' } as T,
  avatar: `https://github.com/${GITHUB_USER}.png?size=320`,
  tagline: {
    ja: 'LLM マルチエージェント × 自動プログラム修復',
    en: 'LLM multi-agent systems × automated program repair',
    zh: 'LLM 多智能体 × 自动程序修复',
  } as T,
  affiliation: {
    ja: '立教大学大学院 人工知能科学研究科（2026年4月〜）',
    en: 'Graduate School of Artificial Intelligence and Science, Rikkyo University (since Apr 2026)',
    zh: '立教大学大学院 人工智能科学研究科（2026年4月起）',
  } as T,
  bio: {
    ja: '金融・証券・通信分野で約6年間 Java / Spring / SQL による業務システム開発に携わった後、大学院で LLM エージェントの研究を始めました。「エージェントに何をさせるか」より「エージェントの出力をどう検証するか」に関心があり、検証器をループの中に置いた長時間稼働のマルチエージェントシステムを作っています。',
    en: 'After about six years building business systems in Java / Spring / SQL for finance, securities and telecom, I moved into research on LLM agents. I care less about what agents can be told to do and more about how their output gets verified, and I build long-running multi-agent systems that keep the checker inside the loop.',
    zh: '曾在金融、证券和通信领域从事约六年 Java / Spring / SQL 业务系统开发，之后进入研究生院研究 LLM 智能体。比起“让智能体做什么”，我更关心“如何验证智能体的输出”，正在构建把验证器放进循环内、可以长时间运行的多智能体系统。',
  } as T,
  languages: {
    ja: '中国語（母語）・日本語（JLPT N2）・英語（技術文書・論文読解）',
    en: 'Chinese (native) · Japanese (JLPT N2) · English (technical reading)',
    zh: '中文（母语）· 日语（JLPT N2）· 英语（可阅读技术文档与论文）',
  } as T,
  links: [
    { label: 'GitHub', url: `https://github.com/${GITHUB_USER}` },
    { label: 'Email (Rikkyo)', url: 'mailto:26vr047w@rikkyo.ac.jp' },
    { label: 'Gmail', url: 'mailto:mj199607@gmail.com' },
    { label: 'X', url: 'https://x.com/Tao199607' },
    // Add more when needed, e.g.
    // { label: 'Zenn', url: 'https://zenn.dev/xxxx' },
    // { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=xxxx' },
  ],
};

// ---------------------------------------------------------------------------
// News (newest first). Also published as the RSS feed at /rss.xml.
// `date` is 'YYYY-MM' or 'YYYY-MM-DD'.
// ---------------------------------------------------------------------------
export const news: { date: string; text: T; url?: string | Partial<T> }[] = [
  {
    date: '2026-11-11',
    text: {
      ja: 'EMNLP 2026 の参加報告を記事として公開しました。',
      en: 'Published my EMNLP 2026 report as a post (Japanese and Chinese).',
      zh: '把 EMNLP 2026 的参会报告整理成文章发布了。',
    },
    url: {
      ja: '/ja/posts/emnlp-2026-insights/',
      en: '/ja/posts/emnlp-2026-insights/',
      zh: '/zh/posts/emnlp-2026-insights/',
    },
  },
  {
    date: '2026-10',
    text: {
      ja: 'THEMIS の論文が EMNLP 2026 ReALM Workshop に採択され、発表しました。',
      en: 'Presented our THEMIS paper at the EMNLP 2026 ReALM Workshop.',
      zh: 'THEMIS 论文被 EMNLP 2026 ReALM Workshop 接收并完成发表。',
    },
  },
  {
    date: '2026-04',
    text: {
      ja: '立教大学大学院 人工知能科学研究科に入学しました。',
      en: 'Started graduate school at Rikkyo University (Artificial Intelligence and Science).',
      zh: '进入立教大学大学院人工智能科学研究科学习。',
    },
  },
];

/** A news item's link for one language (a plain string is shared by all languages). */
export const newsUrl = (n: (typeof news)[number], lang: Lang) => (typeof n.url === 'string' ? n.url : n.url?.[lang]);

// ---------------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------------
export const publications: {
  title: string;
  authors: string; // put your own name in **double asterisks** to bold it
  venue: string;
  year: number;
  links: { label: string; url: string }[];
}[] = [
  {
    title: 'Externalizing Requirement-to-Repair Artifacts as Observable Traces for LLM-Based Program Repair',
    authors: '**Zewen Tao**, Shin-nosuke Ishikawa',
    venue: 'EMNLP 2026 Workshop on ReALM',
    year: 2026,
    links: [
      { label: 'Paper', url: 'https://aclanthology.org/2026.realm-1.30/' },
      { label: 'Code', url: `https://github.com/${GITHUB_USER}/THEMIS` },
    ],
  },
];

// ---------------------------------------------------------------------------
// Featured projects: always shown first, in this order, with a hand-written
// pitch. Any other public repo with the "showcase" topic is appended
// automatically using its GitHub description.
// Optional `image`: a screenshot in public/ (e.g. '/covers/boulder-swarm.png').
// ---------------------------------------------------------------------------
export const featured: { repo: string; pitch: T; image?: string }[] = [
  {
    repo: 'boulder-swarm',
    pitch: {
      ja: 'ゴールと判定器を決めると、タスク分解・並列コーディングエージェント・検証・マージ／リバートを数週間回し続ける長時間型マルチエージェント基盤。判定器が通すまで「完了」とは認めない設計。',
      en: 'A goal-driven multi-agent system for long-horizon work: it splits a goal into tasks, fans them out to parallel coding agents, verifies, merges or reverts, and keeps going for weeks. Nothing counts as done until the checker agrees.',
      zh: '面向长周期任务的目标驱动多智能体系统：把目标拆成任务，分发给并行的编码智能体，验证后合并或回滚，可以连续运行数周。只有检查器通过，任务才算完成。',
    },
  },
  {
    repo: 'agent-baton',
    pitch: {
      ja: 'Claude Code・Codex・opencode など複数のコーディングエージェントで共有するローカル記憶。昨日 Codex に伝えたことを今日 Claude Code が知っている。クォータ切れ時の引き継ぎにも対応。',
      en: 'One local memory shared by Claude Code, Codex and opencode. Tell one agent something today and another knows it tomorrow, with handoff when an agent runs out of quota.',
      zh: 'Claude Code、Codex、opencode 等多个编码智能体共享的本地记忆。今天告诉 Codex 的事，明天 Claude Code 也知道；某个智能体额度用完时，还能把任务交接给下一个。',
    },
  },
  {
    repo: 'THEMIS',
    pitch: {
      ja: 'Issue の要求からコード修正、修正後の検証までの各段階を、要求–コードグラフや修正根拠・監査記録として外部化し、検査可能にする段階的なプログラム修復ワークフロー。SWE-bench Lite 300件で監査（EMNLP 2026 ReALM Workshop）。',
      en: 'A stage-aware LLM repair workflow that externalizes the path from issue requirements to code edits and post-edit audit (requirement–code graph, repair rationale, audit records) so it can be inspected. Audited on 300 SWE-bench Lite cases (EMNLP 2026 ReALM Workshop).',
      zh: '分阶段的 LLM 程序修复工作流：把从 issue 需求到代码修改、再到修改后审计的过程（需求–代码图、修复依据、审计记录）外化出来，使其可以被检查。在 SWE-bench Lite 的 300 个案例上做了审计（EMNLP 2026 ReALM Workshop）。',
    },
  },
  {
    repo: 'Oh-My-AI-Coding-Style-Guide',
    pitch: {
      ja: 'コーディングエージェントの無駄な探索を抑え、確認済みの事実と推測を区別させるためのコンテキスト最適化スキル。',
      en: 'A context-optimization skill that keeps coding agents from over-exploring and makes them separate verified facts from assumptions.',
      zh: '一个上下文优化 skill：减少编码智能体的无效探索，并让它区分已验证的事实和推测。',
    },
  },
];

// ---------------------------------------------------------------------------
// Experience / education (newest first)
// ---------------------------------------------------------------------------
export const timeline: { period: string; title: T; detail: T }[] = [
  {
    period: '2026 –',
    title: {
      ja: '立教大学大学院 人工知能科学研究科',
      en: 'Rikkyo University, Graduate School of AI and Science',
      zh: '立教大学大学院 人工智能科学研究科',
    },
    detail: {
      ja: 'LLM マルチエージェント、自動プログラム修復',
      en: 'LLM multi-agent systems, automated program repair',
      zh: 'LLM 多智能体、自动程序修复',
    },
  },
  {
    period: '~6 yrs',
    title: { ja: 'ソフトウェアエンジニア', en: 'Software engineer', zh: '软件工程师' },
    detail: {
      ja: '金融・証券・通信システムの開発（Java / Spring / SQL）。中国・日本で勤務。',
      en: 'Business systems for finance, securities and telecom (Java / Spring / SQL), in China and Japan.',
      zh: '金融、证券、通信系统开发（Java / Spring / SQL），先后在中国和日本工作。',
    },
  },
];

// ---------------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------------
export const ui = {
  about: { ja: 'About', en: 'About', zh: '关于' },
  news: { ja: 'News', en: 'News', zh: '动态' },
  posts: { ja: '記事', en: 'Posts', zh: '文章' },
  allPosts: { ja: '記事一覧', en: 'All posts', zh: '全部文章' },
  noPostsInLang: {
    ja: 'まだ記事がありません。',
    en: 'No posts in English yet. Posts in other languages:',
    zh: '暂无文章。',
  },
  contents: { ja: '目次', en: 'Contents', zh: '目录' },
  projects: { ja: 'Projects', en: 'Projects', zh: '项目' },
  publications: { ja: 'Publications', en: 'Publications', zh: '论文' },
  experience: { ja: '経歴', en: 'Experience', zh: '经历' },
  languages: { ja: '言語', en: 'Languages', zh: '语言' },
  updated: { ja: '更新', en: 'updated', zh: '更新于' },
  noProjects: { ja: 'まだプロジェクトがありません。', en: 'No projects yet.', zh: '暂无项目。' },
  footer: {
    ja: 'GitHub のリポジトリから毎日自動で更新しています。',
    en: 'Rebuilt daily from my GitHub repositories.',
    zh: '每天根据我的 GitHub 仓库自动更新。',
  },
} satisfies Record<string, T>;
