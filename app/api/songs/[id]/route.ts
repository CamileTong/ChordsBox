import { NextRequest, NextResponse } from "next/server";
import { initGitHubConfig, getSong, saveSong, deleteSong } from "@/lib/github";
import { Song } from "@/types";

// 初始化 GitHub 配置
const token = process.env.GITHUB_TOKEN || "";
const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";

if (token && owner && repo) {
  initGitHubConfig(token, owner, repo);
}

// GET: 获取单个谱子
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub configuration missing" },
        { status: 500 }
      );
    }

    const song = await getSong(params.id);
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("Failed to get song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

// PUT: 更新或创建谱子
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub configuration missing" },
        { status: 500 }
      );
    }

    const song: Song = await request.json();
    if (song.id !== params.id) {
      return NextResponse.json(
        { error: "ID mismatch" },
        { status: 400 }
      );
    }

    await saveSong(song);
    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error("Failed to save song:", error);
    return NextResponse.json(
      { error: "Failed to save song" },
      { status: 500 }
    );
  }
}

// DELETE: 删除谱子
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub configuration missing" },
        { status: 500 }
      );
    }

    await deleteSong(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
