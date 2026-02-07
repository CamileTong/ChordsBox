"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SongMetadata } from "@/types";

export default function SongsPage() {
  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p>加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">谱子列表</h1>
          <Link
            href="/songs/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新建谱子
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索谱子或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? "没有找到匹配的谱子" : "还没有谱子，创建第一个吧！"}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSongs.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2">{song.title}</h2>
                <div className="text-sm text-gray-600 mb-2">
                  <span>调性: {song.key}</span>
                  {song.capo > 0 && <span className="ml-2">变调夹: {song.capo}品</span>}
                </div>
                {song.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
