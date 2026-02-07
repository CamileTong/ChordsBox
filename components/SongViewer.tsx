"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Song } from "@/types";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getDeviceType, getDefaultFontSize } from "@/lib/lyrics";

interface SongViewerProps {
  song: Song;
}

export default function SongViewer({ song }: SongViewerProps) {
  const settings = useSettingsStore((state) => state.settings);
  const setCurrentScheme = useSettingsStore((state) => state.setCurrentScheme);
  const currentScheme = settings.colorSchemes.find(
    (s) => s.id === settings.currentSchemeId
  ) || settings.colorSchemes[0];

  const [fontSize, setFontSize] = useState(16);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  useEffect(() => {
    const deviceType = getDeviceType();
    const defaultSize = getDefaultFontSize(deviceType);
    setFontSize(defaultSize);
    setFontSizeOffset(0);
  }, []);

  const adjustFontSize = (delta: number) => {
    const newOffset = Math.max(-4, Math.min(4, fontSizeOffset + delta));
    setFontSizeOffset(newOffset);
    setFontSize(fontSize + delta);
  };

  const resetFontSize = () => {
    const deviceType = getDeviceType();
    const defaultSize = getDefaultFontSize(deviceType);
    setFontSize(defaultSize);
    setFontSizeOffset(0);
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8 transition-colors"
      style={{
        backgroundColor: currentScheme.colors.background,
        color: currentScheme.colors.lyrics,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* 控制栏 */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustFontSize(-1)}
              disabled={fontSizeOffset <= -4}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentScheme.colors.background,
                borderColor: currentScheme.colors.lyrics,
                color: currentScheme.colors.lyrics,
              }}
            >
              A-
            </button>
            <button
              onClick={resetFontSize}
              className="px-3 py-1 border rounded hover:bg-gray-100"
              style={{
                backgroundColor: currentScheme.colors.background,
                borderColor: currentScheme.colors.lyrics,
                color: currentScheme.colors.lyrics,
              }}
            >
              重置
            </button>
            <button
              onClick={() => adjustFontSize(1)}
              disabled={fontSizeOffset >= 4}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentScheme.colors.background,
                borderColor: currentScheme.colors.lyrics,
                color: currentScheme.colors.lyrics,
              }}
            >
              A+
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">配色方案:</label>
            <select
              value={settings.currentSchemeId}
              onChange={(e) => setCurrentScheme(e.target.value)}
              className="px-3 py-1 border rounded"
              style={{
                backgroundColor: currentScheme.colors.background,
                borderColor: currentScheme.colors.lyrics,
                color: currentScheme.colors.lyrics,
              }}
            >
              {settings.colorSchemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/settings"
            className="text-sm underline opacity-75 hover:opacity-100"
            style={{ color: currentScheme.colors.lyrics }}
          >
            更多设置
          </Link>
        </div>

        {/* 谱子信息 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{song.title}</h1>
          <div className="text-sm opacity-75">
            <span>调性: {song.key}</span>
            {song.capo > 0 && <span className="ml-4">变调夹: {song.capo}品</span>}
            {song.timeSignature && (
              <span className="ml-4">拍号: {song.timeSignature}</span>
            )}
          </div>
        </div>

        {/* 谱子内容 */}
        <div style={{ fontSize: `${fontSize}px` }}>
          {song.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              {section.name && (
                <h2 className="text-xl font-semibold mb-4 opacity-75">
                  {section.name}
                </h2>
              )}

              {section.lines.map((line, lineIndex) => {
                if (!line.lyrics) {
                  return <div key={lineIndex} className="h-4" />; // 空行
                }

                return (
                  <div key={lineIndex} className="mb-3">
                    {/* 和弦行 */}
                    {line.chords.length > 0 && (
                      <div className="mb-1" style={{ minHeight: "1.5em" }}>
                        {line.lyrics.split("").map((char, charIndex) => {
                          const chord = line.chords.find((c) => c.position === charIndex);
                          return (
                            <span
                              key={charIndex}
                              className="inline-block relative"
                              style={{ width: "1em" }}
                            >
                              {chord && (
                                <span
                                  className="absolute -top-5 left-0 whitespace-nowrap font-semibold"
                                  style={{ color: currentScheme.colors.chord }}
                                >
                                  {chord.chord}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* 歌词行 */}
                    <div>
                      {line.lyrics.split("").map((char, charIndex) => {
                        const hasChord = line.chords.some((c) => c.position === charIndex);
                        return (
                          <span
                            key={charIndex}
                            style={{
                              color: hasChord
                                ? currentScheme.colors.chord
                                : currentScheme.colors.lyrics,
                              fontWeight: hasChord ? "bold" : "normal",
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
