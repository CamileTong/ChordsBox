"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function Home() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">ChordsBox 🎸</h1>
        <p className="text-gray-600 mb-8">
          because I&apos;m done seeing extremely small sheet music on my phone!!!
        </p>

        <div className="space-y-4">
          <Link
            href="/songs"
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">查看谱子列表</h2>
            <p className="text-gray-600">浏览所有谱子</p>
          </Link>

          <Link
            href="/songs/new"
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">新建谱子</h2>
            <p className="text-gray-600">创建新的吉他谱</p>
          </Link>

          <Link
            href="/settings"
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">设置</h2>
            <p className="text-gray-600">配色方案和常用和弦配置</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
