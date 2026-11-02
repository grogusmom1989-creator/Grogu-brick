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

export const sanitizeGitHubUsername = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 39);
};

export const fetchGitHubData = async (
  username?: string,
  token?: string
): Promise<GitHubSyncData> => {
  const trimmedToken = token?.trim();
  const rawUser = username?.trim();

  if (!trimmedToken && !rawUser) {
    return {
      user: null,
      repos: [],
      issues: [],
      events: [],
      starred: [],
      error: 'Please provide a GitHub Username or Personal Access Token.',
    };
  }

  // GitHub handles cannot have spaces or special symbols
  const cleanUser = rawUser ? sanitizeGitHubUsername(rawUser) : '';
  const headers = getHeaders(trimmedToken);

  try {
    let user: GitHubUser | null = null;
    let effectiveUsername = cleanUser;

    // 1. Fetch User Profile
    if (trimmedToken) {
      const userRes = await fetch('https://api.github.com/user', { headers });
      if (userRes.ok) {
        user = await userRes.json();
        effectiveUsername = user?.login || effectiveUsername;
      } else if (cleanUser) {
        const pubRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, { headers });
        if (pubRes.ok) {
          user = await pubRes.json();
        }
      }
    } else if (cleanUser) {
      const pubRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, { headers });
      if (pubRes.status === 404) {
        return {
          user: null,
          repos: [],
          issues: [],
          events: [],
          starred: [],
          error: `GitHub user "${rawUser}" was not found. Please verify your GitHub handle (handles cannot contain spaces).`,
        };
      }
      if (pubRes.status === 403) {
        return {
          user: null,
          repos: [],
          issues: [],
          events: [],
          starred: [],
          error: 'GitHub API rate limit exceeded for anonymous requests. Add a Personal Access Token in settings for 5,000 requests/hr.',
        };
      }
      if (pubRes.ok) {
        user = await pubRes.json();
      }
    }

    if (!effectiveUsername && !user) {
      return {
        user: null,
        repos: [],
        issues: [],
        events: [],
        starred: [],
        error: `Unable to find GitHub user "${rawUser}". Please check your handle or use a Personal Access Token.`,
      };
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
      const pubReposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(effectiveUsername)}/repos?sort=updated&per_page=100`, { headers });
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
      const eventsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(effectiveUsername)}/events?per_page=30`, { headers });
      if (eventsRes.ok) {
        events = await eventsRes.json();
      }
    }

    // 5. Fetch Starred Repos
    let starred: GitHubRepo[] = [];
    if (effectiveUsername) {
      const starredRes = await fetch(`https://api.github.com/users/${encodeURIComponent(effectiveUsername)}/starred?per_page=20`, { headers });
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
    // Return gracefully without throwing unhandled exceptions
    return {
      user: null,
      repos: [],
      issues: [],
      events: [],
      starred: [],
      error: err.message || 'Unable to connect to GitHub at this time.',
    };
  }
};
