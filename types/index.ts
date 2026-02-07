// 和弦标注
export interface Chord {
  position: number;
  chord: string;
}

// 歌词行
export interface Line {
  lyrics: string;
  chords: Chord[];
}

// 段落
export interface Section {
  type: string;
  name: string;
  lines: Line[];
}

// 谱子
export interface Song {
  id: string;
  title: string;
  key: string;
  capo: number;
  timeSignature?: string;
  sections: Section[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 谱子元数据（列表用）
export interface SongMetadata {
  id: string;
  title: string;
  key: string;
  capo: number;
  tags: string[];
  updatedAt: string;
}

// 谱子列表
export interface SongsList {
  songs: SongMetadata[];
}

// 配色方案
export interface ColorScheme {
  id: string;
  name: string;
  colors: {
    background: string;
    lyrics: string;
    chord: string;
  };
}

// 用户设置
export interface UserSettings {
  colorSchemes: ColorScheme[];
  currentSchemeId: string;
  commonChords: string[];
}

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
