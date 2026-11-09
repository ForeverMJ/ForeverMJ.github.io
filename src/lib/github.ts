import { GITHUB_USER, SHOWCASE_TOPIC, featured, type T } from '../data/site';

export interface Project {
  name: string;
  url: string;
  homepage?: string;
  description: string;
  pitch?: T;
  language?: string;
  stars: number;
  pushedAt?: string;
  topics: string[];
  /** Optional cover image (path under public/ or a URL). Without it a cover is generated. */
  image?: string;
}

interface ApiRepo {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
  archived: boolean;
}

let cache: Promise<Project[]> | undefined;

/**
 * Featured repos (in the order of `featured`) followed by every other public,
 * non-fork repo tagged with the showcase topic (most recently pushed first).
 * Runs once per build. If the GitHub API is unreachable the build still
 * succeeds and shows the featured list without live stats.
 */
export function getProjects(): Promise<Project[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<Project[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  let repos: ApiRepo[] = [];
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed&type=owner`,
      { headers },
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    repos = (await res.json()) as ApiRepo[];
  } catch (err) {
    console.warn(`[github] could not fetch repos, using featured list only: ${err}`);
  }

  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
  const toProject = (r: ApiRepo | undefined, name: string, pitch?: T, image?: string): Project => ({
    name: r?.name ?? name,
    url: r?.html_url ?? `https://github.com/${GITHUB_USER}/${name}`,
    homepage: r?.homepage || undefined,
    description: r?.description ?? '',
    pitch,
    language: r?.language ?? undefined,
    stars: r?.stargazers_count ?? 0,
    pushedAt: r?.pushed_at,
    topics: (r?.topics ?? []).filter((t) => t !== SHOWCASE_TOPIC),
    image,
  });

  const out: Project[] = [];
  const seen = new Set<string>();
  for (const f of featured) {
    const r = byName.get(f.repo.toLowerCase());
    // When the API answered and the repo is missing, it is private or renamed: skip it.
    if (repos.length > 0 && !r) {
      console.warn(`[github] featured repo "${f.repo}" not found among public repos, skipping`);
      continue;
    }
    out.push(toProject(r, f.repo, f.pitch, f.image));
    seen.add(f.repo.toLowerCase());
  }
  for (const r of repos) {
    if (r.fork || r.archived || seen.has(r.name.toLowerCase())) continue;
    if (!(r.topics ?? []).includes(SHOWCASE_TOPIC)) continue;
    out.push(toProject(r, r.name));
  }
  return out;
}
