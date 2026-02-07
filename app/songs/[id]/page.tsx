"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Song } from "@/types";
import SongViewer from "@/components/SongViewer";

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSong(params.id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchSong = async (id: string) => {
    try {
      const response = await fetch(`/api/songs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSong(data);
      } else {
        router.push("/songs");
      }
    } catch (error) {
      console.error("Failed to fetch song:", error);
      router.push("/songs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p>加载中...</p>
        </div>
      </main>
    );
  }

  if (!song) {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <Link
          href={`/songs/${song.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          编辑
        </Link>
        <Link
          href="/songs"
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          返回列表
        </Link>
      </div>
      <SongViewer song={song} />
    </>
  );
}
