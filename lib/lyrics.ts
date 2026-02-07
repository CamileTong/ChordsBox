import { Chord } from "@/types";

/**
 * 自动分句：按标点符号分割，移除标点符号
 * @param text 输入的歌词文本
 * @returns 分割后的歌词行数组
 */
export function autoSplitLyrics(text: string): string[] {
  // 移除所有空格
  text = text.replace(/\s+/g, "");

  // 按标点符号分割（保留分隔符用于识别）
  const separators = /([，。、；：！？])/g;
  const parts = text.split(separators);

  const lines: string[] = [];
  let currentLine = "";

  for (const part of parts) {
    // 如果是分隔符
    if (separators.test(part)) {
      // 将当前累积的内容作为一行（不含标点）
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = ""; // 重置
    } else {
      // 是文本内容，累积
      currentLine += part;
    }
  }

  // 处理最后一行（如果没有以标点结尾）
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * 解析文本标记格式 [和弦]歌词
 * @param text 包含标记的文本
 * @returns 解析后的歌词和和弦数组
 */
export function parseChordMarkers(text: string): {
  lyrics: string;
  chords: Chord[];
} {
  const pattern = /\[([^\]]+)\](.)/g;
  const chords: Chord[] = [];
  let cleanText = text;
  let offset = 0;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const chord = match[1];
    const charAfter = match[2];
    const position = match.index - offset; // 考虑已移除的标记长度

    chords.push({
      position,
      chord,
    });

    // 从文本中移除 [和弦] 标记，保留后面的字符
    cleanText = cleanText.replace(match[0], charAfter);
    offset += match[0].length - charAfter.length;
  }

  return {
    lyrics: cleanText,
    chords,
  };
}

/**
 * 获取设备类型
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * 获取设备默认字号
 */
export function getDefaultFontSize(deviceType: "mobile" | "tablet" | "desktop"): number {
  switch (deviceType) {
    case "mobile":
      return 14;
    case "tablet":
      return 16;
    case "desktop":
      return 18;
  }
}
