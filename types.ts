
export enum TranslationType {
  BUBBLE = 'گفتگو',
  THOUGHT = 'افکار',
  SFX = 'افکت صوتی',
  NARRATION = 'راوی',
  OTHER = 'سایر'
}

export enum ToneType {
  CASUAL = 'عامیانه',
  FORMAL = 'رسمی',
  ANGRY = 'عصبانی',
  SCARED = 'ترسیده'
}

export enum ManhuaGenre {
  MODERN = 'مدرن / روزمره (Modern Slice of Life)',
  SCHOOL = 'مدرسه ای / گنگستری (School Life / Bullying)',
  WUXIA = 'تاریخی / رزمی (Murim / Wuxia)',
  ROYAL = 'سلطنتی / درباری (Royal Court / Historical)',
  XIANXIA = 'افسانه ای / جاودانگی (Xianxia / High Fantasy)',
  SYSTEM = 'سیستم / لول آپ (System / Dungeon)',
  URBAN_CULTIVATION = 'تهذیب در دنیای مدرن (Urban Cultivation)',
  ROMANCE = 'عاشقانه / شوجو (Romance / Shoujo)',
  COMEDY = 'کمدی (Comedy)'
}

export interface GlossaryEntry {
  id: string;
  term: string;
  translation: string;
}

export interface TranslationItem {
  id: number;
  originalText: string;
  translatedText: string;
  type: TranslationType;
  tone: ToneType;
  notes?: string; 
}

export interface ManhuaPage {
  id: string;
  imageUrl: string;
  imageFile: File;
  translations: TranslationItem[];
  isAnalyzing: boolean;
}

export interface ProjectSettings {
  genre: ManhuaGenre;
  glossary: GlossaryEntry[];
  selectedModel?: string;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: number;
  genre: ManhuaGenre;
  translations: TranslationItem[];
}
