"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Song, Line, Chord } from "@/types";
import { autoSplitLyrics, parseChordMarkers } from "@/lib/lyrics";
import { useSettingsStore } from "@/store/useSettingsStore";

interface SongEditorProps {
  song: Song;
  isNew: boolean;
}

export default function SongEditor({ song: initialSong, isNew }: SongEditorProps) {
  const router = useRouter();
  const settings = useSettingsStore((state) => state.settings);
  const [song, setSong] = useState<Song>(initialSong);
  const [lyricsInput, setLyricsInput] = useState("");
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [customChord, setCustomChord] = useState("");

  // 初始化歌词输入（从第一个 section 的第一行开始）
  useEffect(() => {
    if (song.sections[0]?.lines.length > 0) {
      const allLyrics = song.sections[0].lines
        .map((line) => line.lyrics)
        .filter((l) => l)
        .join("，");
      setLyricsInput(allLyrics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAutoSplit = () => {
    if (!lyricsInput.trim()) return;

    const lines = autoSplitLyrics(lyricsInput);
    const parsedLines: Line[] = lines.map((lineText) => {
      const { lyrics, chords } = parseChordMarkers(lineText);
      return {
        lyrics,
        chords: chords.sort((a, b) => a.position - b.position),
      };
    });

    setSong({
      ...song,
      sections: [
        {
          ...song.sections[0],
          lines: parsedLines,
        },
      ],
    });
  };

  const handleAddChord = (chord: string, lineIndex: number, charIndex: number) => {
    const newSections = [...song.sections];
    const line = { ...newSections[0].lines[lineIndex] };
    const chords = [...line.chords];

    // 检查是否已存在该位置的和弦
    const existingIndex = chords.findIndex((c) => c.position === charIndex);
    if (existingIndex >= 0) {
      chords[existingIndex] = { position: charIndex, chord };
    } else {
      chords.push({ position: charIndex, chord });
      chords.sort((a, b) => a.position - b.position);
    }

    line.chords = chords;
    newSections[0].lines[lineIndex] = line;

    setSong({ ...song, sections: newSections });
    setEditingLineIndex(null);
    setEditingCharIndex(null);
  };

  const handleRemoveChord = (lineIndex: number, chordIndex: number) => {
    const newSections = [...song.sections];
    const line = { ...newSections[0].lines[lineIndex] };
    line.chords = line.chords.filter((_, i) => i !== chordIndex);
    newSections[0].lines[lineIndex] = line;
    setSong({ ...song, sections: newSections });
  };

  const handleAddEmptyLine = (index: number) => {
    const newSections = [...song.sections];
    newSections[0].lines.splice(index, 0, { lyrics: "", chords: [] });
    setSong({ ...song, sections: newSections });
  };

  const handleDeleteLine = (index: number) => {
    const newSections = [...song.sections];
    newSections[0].lines.splice(index, 1);
    setSong({ ...song, sections: newSections });
  };

  const handleSave = async () => {
    try {
      if (!song.title.trim()) {
        alert("请输入标题");
        return;
      }

      // 生成 ID（如果是新谱子）
      let songId = song.id;
      if (isNew || !songId) {
        songId = song.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        setSong({ ...song, id: songId });
      }

      const songToSave = { ...song, id: songId, updatedAt: new Date().toISOString() };

      // 保存谱子数据
      const response = await fetch(`/api/songs/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songToSave),
      });

      if (response.ok) {
        // 如果是新谱子，添加到列表
        if (isNew) {
          await fetch("/api/songs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: songId,
              title: song.title,
              key: song.key,
              capo: song.capo,
              tags: song.tags,
              updatedAt: songToSave.updatedAt,
            }),
          });
        }
        router.push(`/songs/${songId}`);
      } else {
        const error = await response.json();
        alert(`保存失败: ${error.error || "未知错误"}`);
      }
    } catch (error) {
      console.error("Failed to save song:", error);
      alert("保存失败，请重试");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isNew ? "新建谱子" : "编辑谱子"}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">标题</label>
              <input
                type="text"
                value={song.title}
                onChange={(e) => setSong({ ...song, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="歌曲标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">调性</label>
              <input
                type="text"
                value={song.key}
                onChange={(e) => setSong({ ...song, key: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">变调夹</label>
              <input
                type="number"
                min="0"
                max="12"
                value={song.capo}
                onChange={(e) =>
                  setSong({ ...song, capo: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">拍号（可选）</label>
              <input
                type="text"
                value={song.timeSignature || ""}
                onChange={(e) =>
                  setSong({ ...song, timeSignature: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="4/4"
              />
            </div>
          </div>
        </div>

        {/* 歌词输入区 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">歌词输入</h2>
          <textarea
            value={lyricsInput}
            onChange={(e) => setLyricsInput(e.target.value)}
            placeholder="输入歌词，支持 [Am]歌词 格式标记和弦"
            className="w-full h-32 px-3 py-2 border rounded-lg mb-4"
          />
          <button
            onClick={handleAutoSplit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            自动分句
          </button>
        </div>

        {/* 和弦标注区 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">和弦标注</h2>

          {/* 常用和弦快捷按钮 */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.commonChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => {
                    if (
                      editingLineIndex !== null &&
                      editingCharIndex !== null
                    ) {
                      handleAddChord(
                        chord,
                        editingLineIndex,
                        editingCharIndex
                      );
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {chord}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customChord}
                onChange={(e) => setCustomChord(e.target.value)}
                placeholder="自定义和弦"
                className="px-3 py-1 border rounded"
              />
              <button
                onClick={() => {
                  if (
                    customChord &&
                    editingLineIndex !== null &&
                    editingCharIndex !== null
                  ) {
                    handleAddChord(
                      customChord,
                      editingLineIndex,
                      editingCharIndex
                    );
                    setCustomChord("");
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>

          {/* 歌词行编辑 */}
          <div className="space-y-4">
            {song.sections[0]?.lines.map((line, lineIndex) => (
              <div key={lineIndex} className="border-b pb-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1">
                    {/* 和弦行 */}
                    {line.chords.length > 0 && (
                      <div className="mb-1 text-sm text-gray-600">
                        {line.lyrics.split("").map((char, charIndex) => {
                          const chord = line.chords.find(
                            (c) => c.position === charIndex
                          );
                          return (
                            <span
                              key={charIndex}
                              className="inline-block relative"
                              style={{ width: "1em" }}
                            >
                              {chord && (
                                <span className="absolute -top-4 left-0 whitespace-nowrap">
                                  {chord.chord}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* 歌词行 */}
                    <div className="flex items-center gap-1">
                      {line.lyrics.split("").map((char, charIndex) => (
                        <button
                          key={charIndex}
                          onClick={() => {
                            setEditingLineIndex(lineIndex);
                            setEditingCharIndex(charIndex);
                          }}
                          className={`px-1 py-1 rounded ${
                            editingLineIndex === lineIndex &&
                            editingCharIndex === charIndex
                              ? "bg-blue-200"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleAddEmptyLine(lineIndex)}
                      className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                    >
                      上插空行
                    </button>
                    <button
                      onClick={() => handleDeleteLine(lineIndex)}
                      className="px-2 py-1 text-xs bg-red-100 rounded hover:bg-red-200"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 和弦列表 */}
                {line.chords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {line.chords.map((chord, chordIndex) => (
                      <span
                        key={chordIndex}
                        className="px-2 py-1 bg-blue-100 rounded text-sm flex items-center gap-1"
                      >
                        <span>
                          位置{chord.position}: {chord.chord}
                        </span>
                        <button
                          onClick={() => handleRemoveChord(lineIndex, chordIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 添加空行按钮 */}
            <button
              onClick={() => {
                const newSections = [...song.sections];
                newSections[0].lines.push({ lyrics: "", chords: [] });
                setSong({ ...song, sections: newSections });
              }}
              className="px-4 py-2 border-2 border-dashed rounded-lg hover:bg-gray-50"
            >
              + 添加空行（间奏）
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
