import { NextRequest, NextResponse } from "next/server";
import { initGitHubConfig, getSongsList, saveSongsList } from "@/lib/github";
import { SongMetadata } from "@/types";

// 初始化 GitHub 配置（从环境变量）
const token = process.env.GITHUB_TOKEN || "";
const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";

if (token && owner && repo) {
  initGitHubConfig(token, owner, repo);
}

// GET: 获取谱子列表
export async function GET() {
  try {
    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub configuration missing" },
        { status: 500 }
      );
    }

    const songs = await getSongsList();
    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Failed to get songs list:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

// POST: 创建新谱子（添加到列表）
export async function POST(request: NextRequest) {
  try {
    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub configuration missing" },
        { status: 500 }
      );
    }

    const metadata: SongMetadata = await request.json();
    const songs = await getSongsList();

    // 检查是否已存在
    if (songs.find((s) => s.id === metadata.id)) {
      return NextResponse.json(
        { error: "Song already exists" },
        { status: 400 }
      );
    }

    songs.push(metadata);
    await saveSongsList(songs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create song:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}
