"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Song, Line, Section } from "@/types";
import SongEditor from "@/components/SongEditor";

export default function NewSongPage() {
  const router = useRouter();

  const newSong: Song = {
    id: "",
    title: "",
    key: "C",
    capo: 0,
    sections: [
      {
        type: "verse",
        name: "主歌",
        lines: [],
      },
    ],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <SongEditor song={newSong} isNew />;
}
