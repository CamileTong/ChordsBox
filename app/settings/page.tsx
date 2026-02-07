"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useState } from "react";

export default function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const setCurrentScheme = useSettingsStore((state) => state.setCurrentScheme);
  const addColorScheme = useSettingsStore((state) => state.addColorScheme);
  const updateColorScheme = useSettingsStore((state) => state.updateColorScheme);
  const deleteColorScheme = useSettingsStore((state) => state.deleteColorScheme);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  const [editingScheme, setEditingScheme] = useState<string | null>(null);
  const [newScheme, setNewScheme] = useState({
    name: "",
    background: "#ffffff",
    lyrics: "#000000",
    chord: "#0066cc",
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleAddScheme = () => {
    if (!newScheme.name.trim()) return;

    const id = newScheme.name.toLowerCase().replace(/\s+/g, "-");
    addColorScheme({
      id,
      name: newScheme.name,
      colors: {
        background: newScheme.background,
        lyrics: newScheme.lyrics,
        chord: newScheme.chord,
      },
    });

    setNewScheme({
      name: "",
      background: "#ffffff",
      lyrics: "#000000",
      chord: "#0066cc",
    });
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">设置</h1>

        {/* 配色方案 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">配色方案</h2>

          {/* 当前配色方案列表 */}
          <div className="space-y-4 mb-6">
            {settings.colorSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className={`p-4 border-2 rounded-lg ${
                  settings.currentSchemeId === scheme.id
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold">{scheme.name}</h3>
                    {settings.currentSchemeId === scheme.id && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        当前使用
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentScheme(scheme.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      应用
                    </button>
                    {editingScheme === scheme.id ? (
                      <button
                        onClick={() => setEditingScheme(null)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        取消
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingScheme(scheme.id)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          编辑
                        </button>
                        {settings.colorSchemes.length > 1 && (
                          <button
                            onClick={() => deleteColorScheme(scheme.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            删除
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {editingScheme === scheme.id ? (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm mb-1">背景色</label>
                      <input
                        type="color"
                        value={scheme.colors.background}
                        onChange={(e) =>
                          updateColorScheme(scheme.id, {
                            colors: {
                              ...scheme.colors,
                              background: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10"
                      />
                      <input
                        type="text"
                        value={scheme.colors.background}
                        onChange={(e) =>
                          updateColorScheme(scheme.id, {
                            colors: {
                              ...scheme.colors,
                              background: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">歌词色</label>
                      <input
                        type="color"
                        value={scheme.colors.lyrics}
                        onChange={(e) =>
                          updateColorScheme(scheme.id, {
                            colors: {
                              ...scheme.colors,
                              lyrics: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10"
                      />
                      <input
                        type="text"
                        value={scheme.colors.lyrics}
                        onChange={(e) =>
                          updateColorScheme(scheme.id, {
                            colors: {
                              ...scheme.colors,
                              lyrics: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">重点色</label>
                      <input
                        type="color"
                        value={scheme.colors.chord}
                        onChange={(e) =>
                          updateColorScheme(scheme.id, {
                            colors: {
                              ...scheme.colors,
                              chord: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10"
                      />
                      <input
                        type="text"
                        value={scheme.colors.chord}
                        onChange={(e) =>
                          updateColorScheme(scheme.id, {
                            colors: {
                              ...scheme.colors,
                              chord: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-4 rounded mt-2"
                    style={{ backgroundColor: scheme.colors.background }}
                  >
                    <div
                      className="text-lg mb-2"
                      style={{ color: scheme.colors.lyrics }}
                    >
                      示例歌词
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: scheme.colors.chord }}
                    >
                      Am 示例和弦
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 添加新配色方案 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">添加新配色方案</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1">方案名称</label>
                <input
                  type="text"
                  value={newScheme.name}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="方案名称"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">背景色</label>
                <input
                  type="color"
                  value={newScheme.background}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, background: e.target.value })
                  }
                  className="w-full h-10"
                />
                <input
                  type="text"
                  value={newScheme.background}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, background: e.target.value })
                  }
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">歌词色</label>
                <input
                  type="color"
                  value={newScheme.lyrics}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, lyrics: e.target.value })
                  }
                  className="w-full h-10"
                />
                <input
                  type="text"
                  value={newScheme.lyrics}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, lyrics: e.target.value })
                  }
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">重点色</label>
                <input
                  type="color"
                  value={newScheme.chord}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, chord: e.target.value })
                  }
                  className="w-full h-10"
                />
                <input
                  type="text"
                  value={newScheme.chord}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, chord: e.target.value })
                  }
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleAddScheme}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              添加配色方案
            </button>
          </div>
        </div>

        {/* 常用和弦配置 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">常用和弦</h2>
          <p className="text-gray-600 mb-4">
            当前预设: {settings.commonChords.join(", ")}
          </p>
          <p className="text-sm text-gray-500">
            （常用和弦配置将在后续版本中支持编辑）
          </p>
        </div>
      </div>
    </main>
  );
}
