import { Song, SongMetadata, SongsList } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

let config: GitHubConfig | null = null;

/**
 * 初始化 GitHub API 配置
 */
export function initGitHubConfig(token: string, owner: string, repo: string) {
  config = { token, owner, repo };
}

/**
 * 获取 GitHub API 配置
 */
function getConfig(): GitHubConfig {
  if (!config) {
    throw new Error("GitHub config not initialized. Call initGitHubConfig first.");
  }
  return config;
}

/**
 * 读取文件内容
 */
async function getFileContent(path: string): Promise<{ content: string; sha: string }> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return { content: "", sha: "" };
    }
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const data = await response.json();
  const content = atob(data.content); // base64 解码
  return { content, sha: data.sha };
}

/**
 * 写入文件内容
 */
async function putFileContent(
  path: string,
  content: string,
  sha: string | null,
  message: string
): Promise<void> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message,
        content: btoa(content), // base64 编码
        sha: sha || undefined, // 如果是新文件，sha 为 null
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update file: ${error.message || response.statusText}`);
  }
}

/**
 * 获取谱子列表
 */
export async function getSongsList(): Promise<SongMetadata[]> {
  const { content } = await getFileContent("data/songs.json");
  if (!content) {
    return [];
  }
  const data: SongsList = JSON.parse(content);
  return data.songs || [];
}

/**
 * 保存谱子列表
 */
export async function saveSongsList(songs: SongMetadata[]): Promise<void> {
  const path = "data/songs.json";
  const { sha } = await getFileContent(path);

  const data: SongsList = { songs };
  await putFileContent(path, JSON.stringify(data, null, 2), sha, "Update songs list");
}

/**
 * 获取单个谱子
 */
export async function getSong(id: string): Promise<Song | null> {
  try {
    const { content } = await getFileContent(`data/songs/${id}.json`);
    if (!content) {
      return null;
    }
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to get song ${id}:`, error);
    return null;
  }
}

/**
 * 保存单个谱子
 */
export async function saveSong(song: Song): Promise<void> {
  const path = `data/songs/${song.id}.json`;
  let sha: string | null = null;
  
  try {
    const fileData = await getFileContent(path);
    sha = fileData.sha || null;
  } catch (error) {
    // 文件不存在，sha 为 null（新文件）
    sha = null;
  }

  song.updatedAt = new Date().toISOString();
  const message = sha ? `Update song: ${song.title}` : `Create song: ${song.title}`;
  await putFileContent(path, JSON.stringify(song, null, 2), sha, message);
}

/**
 * 删除谱子
 */
export async function deleteSong(id: string): Promise<void> {
  const path = `data/songs/${id}.json`;
  const { sha } = await getFileContent(path);

  if (!sha) {
    throw new Error("Song not found");
  }

  const { token, owner, repo } = getConfig();
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Delete song: ${id}`,
        sha,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete song: ${response.statusText}`);
  }
}
