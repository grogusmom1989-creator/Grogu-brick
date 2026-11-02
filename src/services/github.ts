import { GitHubRepo, GitHubIssue, GitHubEvent } from '../types';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubSyncData {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  issues: GitHubIssue[];
  events: GitHubEvent[];
  starred: GitHubRepo[];
  rateLimitRemaining?: number;
  error?: string;
}

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
};

export const fetchGitHubData = async (
  username?: string,
  token?: string
): Promise<GitHubSyncData> => {
  const trimmedToken = token?.trim();
  const trimmedUser = username?.trim();

  if (!trimmedToken && !trimmedUser) {
    return {
      user: null,
      repos: [],
      issues: [],
      events: [],
      starred: [],
      error: 'Please provide a GitHub Username or Personal Access Token.',
    };
  }

  const headers = getHeaders(trimmedToken);

  try {
    let user: GitHubUser | null = null;
    let effectiveUsername = trimmedUser;

    // 1. Fetch User Profile
    if (trimmedToken) {
      const userRes = await fetch('https://api.github.com/user', { headers });
      if (userRes.ok) {
        user = await userRes.json();
        effectiveUsername = user?.login || effectiveUsername;
      } else if (trimmedUser) {
        // Fallback to public user endpoint
        const pubRes = await fetch(`https://api.github.com/users/${trimmedUser}`, { headers });
        if (pubRes.ok) user = await pubRes.json();
      }
    } else if (trimmedUser) {
      const pubRes = await fetch(`https://api.github.com/users/${trimmedUser}`, { headers });
      if (!pubRes.ok) {
        throw new Error(`GitHub user "${trimmedUser}" not found or rate limited.`);
      }
      user = await pubRes.json();
    }

    if (!effectiveUsername && !user) {
      throw new Error('Unable to authenticate with GitHub. Check your token or username.');
    }

    // 2. Fetch Repositories
    let repos: GitHubRepo[] = [];
    if (trimmedToken) {
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator', { headers });
      if (reposRes.ok) {
        repos = await reposRes.json();
      }
    }
    
    if (repos.length === 0 && effectiveUsername) {
      const pubReposRes = await fetch(`https://api.github.com/users/${effectiveUsername}/repos?sort=updated&per_page=100`, { headers });
      if (pubReposRes.ok) {
        repos = await pubReposRes.json();
      }
    }

    // 3. Fetch Issues & Pull Requests
    let issues: GitHubIssue[] = [];
    if (trimmedToken) {
      const issuesRes = await fetch('https://api.github.com/user/issues?filter=all&state=all&per_page=50', { headers });
      if (issuesRes.ok) {
        const rawIssues = await issuesRes.json();
        issues = rawIssues.map((iss: any) => ({
          ...iss,
          repo_name: iss.repository?.name || iss.repository_url?.split('/').slice(-1)[0],
        }));
      }
    }

    // 4. Fetch Events / Commits Activity
    let events: GitHubEvent[] = [];
    if (effectiveUsername) {
      const eventsRes = await fetch(`https://api.github.com/users/${effectiveUsername}/events?per_page=30`, { headers });
      if (eventsRes.ok) {
        events = await eventsRes.json();
      }
    }

    // 5. Fetch Starred Repos
    let starred: GitHubRepo[] = [];
    if (effectiveUsername) {
      const starredRes = await fetch(`https://api.github.com/users/${effectiveUsername}/starred?per_page=20`, { headers });
      if (starredRes.ok) {
        starred = await starredRes.json();
      }
    }

    return {
      user,
      repos: Array.isArray(repos) ? repos : [],
      issues: Array.isArray(issues) ? issues : [],
      events: Array.isArray(events) ? events : [],
      starred: Array.isArray(starred) ? starred : [],
    };
  } catch (err: any) {
    console.error('GitHub fetch failed:', err);
    return {
      user: null,
      repos: [],
      issues: [],
      events: [],
      starred: [],
      error: err.message || 'Failed to sync GitHub data',
    };
  }
};
