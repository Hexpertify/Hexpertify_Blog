const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'ranjanihub';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Hexpertify_Blog';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

async function githubRequest(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getFileSha(path: string): Promise<string | null> {
  try {
    const data = await githubRequest(`/contents/${path}?ref=${GITHUB_BRANCH}`);
    return data.sha;
  } catch (error: any) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function commitFile(path: string, content: string, message: string) {
  const sha = await getFileSha(path);
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    sha: sha || undefined,
    branch: GITHUB_BRANCH,
  };
  await githubRequest(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function commitBinaryFile(path: string, bytes: Uint8Array, message: string) {
  const sha = await getFileSha(path);
  const body = {
    message,
    content: Buffer.from(bytes).toString('base64'),
    sha: sha || undefined,
    branch: GITHUB_BRANCH,
  };
  await githubRequest(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getFileContent(path: string): Promise<string | null> {
  try {
    const data = await githubRequest(`/contents/${path}?ref=${GITHUB_BRANCH}`);
    return Buffer.from(data.content, 'base64').toString('utf8');
  } catch (error: any) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function listDirectory(path: string): Promise<string[]> {
  try {
    const data = await githubRequest(`/contents/${path}?ref=${GITHUB_BRANCH}`);
    return data.filter((item: any) => item.type === 'file').map((item: any) => item.name);
  } catch (error: any) {
    if (error.message.includes('404')) {
      return [];
    }
    throw error;
  }
}

export async function deleteFile(path: string, message: string) {
  const sha = await getFileSha(path);
  if (!sha) {
    throw new Error('File not found');
  }
  const body = {
    message,
    sha,
    branch: GITHUB_BRANCH,
  };
  await githubRequest(`/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getGithubRawUrl(path: string): string {
  const owner = GITHUB_OWNER;
  const repo = GITHUB_REPO;
  const branch = GITHUB_BRANCH;
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`;
}

export async function triggerRebuild() {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hookUrl) {
    console.warn('NETLIFY_BUILD_HOOK_URL not set, skipping rebuild');
    return;
  }
  await fetch(hookUrl, {
    method: 'POST',
  });
}