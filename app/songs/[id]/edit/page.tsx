"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Song } from "@/types";
import SongEditor from "@/components/SongEditor";

export default function EditSongPage() {
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

  return <SongEditor song={song} isNew={false} />;
}
