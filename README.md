# forevermj.github.io

我的个人主页（Astro，日 / 英 / 中三语），通过 GitHub Pages 部署。

## 日常更新

| 想做的事 | 怎么做 |
|---|---|
| 新项目自动出现在主页 | 给公开仓库加 topic `showcase`，第二天自动收录（或手动运行 Actions） |
| 给项目写日英介绍、排到前面 | 编辑 `src/data/site.ts` 里的 `featured` |
| 项目封面用截图 | 图片放到 `public/covers/`，在 `featured` 里写 `image: '/covers/xxx.png'` |
| 发新闻 / 论文 / 改经历 | 编辑 `src/data/site.ts` 里的 `news` / `publications` / `timeline` |

所有内容都集中在 `src/data/site.ts`，每段文字都有 `ja` / `en` / `zh` 三个版本。
star 数、语言、更新时间是构建时从 GitHub API 拉的，Actions 每天 06:00 JST 重新构建一次。

## 本地预览

```bash
npm install
npm run dev
```

## 首次部署

1. 把这个目录的内容推到 `ForeverMJ.github.io` 仓库的 `main` 分支。
2. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
3. 推送后 Actions 会自动构建并发布到 https://forevermj.github.io 。
