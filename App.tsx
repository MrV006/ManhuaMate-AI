
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ManhuaPage, TranslationItem, ProjectSettings, ManhuaGenre, GlossaryEntry, HistoryItem } from './types';
import { analyzeManhuaPage } from './services/geminiService';
import { exportToWord } from './utils/exportUtils';
import { Editor } from './components/Editor';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { WordPreview } from './components/WordPreview';
import { PageNavigator } from './components/PageNavigator';
import { Upload, Download, Loader2, Image as ImageIcon, FileText, Settings, Clipboard, History, Eye, CheckCircle2, Github } from 'lucide-react';

// Comprehensive Default Glossary for Manhua/Manhwa
const DEFAULT_GLOSSARY: GlossaryEntry[] = [
  // --- System / Game Terms ---
  { id: 'sys1', term: 'System', translation: 'سیستم' },
  { id: 'sys2', term: 'Quest', translation: 'ماموریت' },
  { id: 'sys3', term: 'Hidden Quest', translation: 'ماموریت مخفی' },
  { id: 'sys4', term: 'Skill', translation: 'مهارت' },
  { id: 'sys5', term: 'Active Skill', translation: 'مهارت فعال' },
  { id: 'sys6', term: 'Passive Skill', translation: 'مهارت غیرفعال' },
  { id: 'sys7', term: 'Inventory', translation: 'اینونتوری / کوله پشتی' },
  { id: 'sys8', term: 'Status Window', translation: 'پنجره وضعیت' },
  { id: 'sys9', term: 'Stats', translation: 'آمار / وضعیت' },
  { id: 'sys10', term: 'Agility', translation: 'چابکی' },
  { id: 'sys11', term: 'Strength', translation: 'قدرت' },
  { id: 'sys12', term: 'Intelligence', translation: 'هوش' },
  { id: 'sys13', term: 'Mana', translation: 'مانا' },
  { id: 'sys14', term: 'Guild', translation: 'گیلد / انجمن' },
  { id: 'sys15', term: 'Dungeon', translation: 'دانجن / سیاهچاله' },
  { id: 'sys16', term: 'Boss', translation: 'باس / رئیس' },
  { id: 'sys17', term: 'Cooldown', translation: 'زمان انتظار / کول‌داون' },
  { id: 'sys18', term: 'NPC', translation: 'شخصیت غیرقابل بازی (NPC)' },
  { id: 'sys19', term: 'Level Up', translation: 'ارتقای سطح' },
  
  // --- Cultivation / Murim Terms ---
  { id: 'cult1', term: 'Qi', translation: 'چی' },
  { id: 'cult2', term: 'Internal Energy', translation: 'انرژی درونی' },
  { id: 'cult3', term: 'Cultivation', translation: 'تهذیب' },
  { id: 'cult4', term: 'Sect', translation: 'فرقه' },
  { id: 'cult5', term: 'Clan', translation: 'خاندان' },
  { id: 'cult6', term: 'Elder', translation: 'ارشد / ریش‌سفید' },
  { id: 'cult7', term: 'Sect Leader', translation: 'رهبر فرقه' },
  { id: 'cult8', term: 'Young Master', translation: 'ارباب جوان' },
  { id: 'cult9', term: 'Disciple', translation: 'شاگرد' },
  { id: 'cult10', term: 'Senior Brother', translation: 'برادر ارشد' },
  { id: 'cult11', term: 'Junior Sister', translation: 'خواهر کوچکتر' },
  { id: 'cult12', term: 'Dao', translation: 'دائو' },
  { id: 'cult13', term: 'Dantian', translation: 'دانتیان' },
  { id: 'cult14', term: 'Meridians', translation: 'مریدین‌ها / رگ‌های انرژی' },
  { id: 'cult15', term: 'Tribulation', translation: 'عذاب آسمانی' },
  { id: 'cult16', term: 'Immortal', translation: 'جاودانه' },
  { id: 'cult17', term: 'Demon Sect', translation: 'فرقه شیطانی' },
  
  // --- Royal / Historical ---
  { id: 'roy1', term: 'Your Majesty', translation: 'اعلی‌حضرت' },
  { id: 'roy2', term: 'Imperial Decree', translation: 'فرمان امپراتور' },
  { id: 'roy3', term: 'Eunuch', translation: 'خواجه' },
  { id: 'roy4', term: 'Concubine', translation: 'صیغه سلطنتی' },
  { id: 'roy5', term: 'Empress', translation: 'ملکه' },
  
  // --- General / Honorifics ---
  { id: 'gen1', term: 'Oppa', translation: 'داداشی / اوپا' },
  { id: 'gen2', term: 'Hyung', translation: 'هیونگ / داداش' },
  { id: 'gen3', term: 'Noona', translation: 'نونا / آبجی' },
  { id: 'gen4', term: 'Sunbae', translation: 'ارشد' },

  // --- Names / Persons (Examples) ---
  { id: 'name1', term: 'Main Character', translation: 'شخصیت اصلی' },
  { id: 'name2', term: 'Xiao', translation: 'شیائو' },
  { id: 'name3', term: 'Long', translation: 'لونگ (اژدها)' },
  { id: 'name4', term: 'Feng', translation: 'فنگ (ققنوس)' },

  // --- Places (Examples) ---
  { id: 'place1', term: 'Mount Hua', translation: 'کوه هوآ' },
  { id: 'place2', term: 'Capital', translation: 'پایتخت' },
  { id: 'place3', term: 'Inner Court', translation: 'دربار داخلی' },
  { id: 'place4', term: 'Pavilion', translation: 'عمارت کلاه‌فرنگی' },

  // --- Techniques / Skills (Examples) ---
  { id: 'tech1', term: 'Sword Intent', translation: 'قصد شمشیر' },
  { id: 'tech2', term: 'Fist Technique', translation: 'تکنیک مشت' },
  { id: 'tech3', term: 'Divine Art', translation: 'هنر الهی' },
  { id: 'tech4', term: 'Formation', translation: 'آرایه / طلسم' },
];

const App: React.FC = () => {
  const [pages, setPages] = useState<ManhuaPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'settings'>('editor');
  
  // Feature States
  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  // Global Project Settings
  const [settings, setSettings] = useState<ProjectSettings>({
    genre: ManhuaGenre.SYSTEM,
    glossary: DEFAULT_GLOSSARY,
    selectedModel: 'gemini-2.5-flash'
  });

  const activePage = pages.find(p => p.id === activePageId) || null;

  // Helper to update the active page
  const updateActivePage = useCallback((updater: (p: ManhuaPage) => ManhuaPage) => {
    if (!activePageId) return;
    setPages(prev => prev.map(p => p.id === activePageId ? updater(p) : p));
  }, [activePageId]);

  // Helper to update a specific page by ID
  const updatePageById = useCallback((id: string, updater: (p: ManhuaPage) => ManhuaPage) => {
    setPages(prev => prev.map(p => p.id === id ? updater(p) : p));
  }, []);

  // --- UNDO / REDO LOGIC ---

  const handleTranslationChange = (newTranslations: TranslationItem[]) => {
    updateActivePage(p => ({
      ...p,
      translations: newTranslations
    }));
  };

  const handleHistoryCommit = () => {
    updateActivePage(p => {
      // Avoid duplicate history entries
      const lastHistory = p.history[p.historyIndex];
      if (JSON.stringify(lastHistory) === JSON.stringify(p.translations)) {
          return p;
      }

      const currentHistory = p.history.slice(0, p.historyIndex + 1);
      const newHistory = [...currentHistory, p.translations];
      
      // Limit history size to 50 states
      if (newHistory.length > 50) newHistory.shift();

      return {
        ...p,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  };

  const handleUndo = () => {
    updateActivePage(p => {
      if (p.historyIndex <= 0) return p;
      const newIndex = p.historyIndex - 1;
      return {
        ...p,
        historyIndex: newIndex,
        translations: p.history[newIndex]
      };
    });
  };

  const handleRedo = () => {
    updateActivePage(p => {
      if (p.historyIndex >= p.history.length - 1) return p;
      const newIndex = p.historyIndex + 1;
      return {
        ...p,
        historyIndex: newIndex,
        translations: p.history[newIndex]
      };
    });
  };

  // --- AUTO SAVE LOGIC ---
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!activePage || activePage.isAnalyzing || activePage.translations.length === 0) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save to localStorage (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      const historyItem: HistoryItem = {
        id: activePage.id,
        fileName: activePage.imageFile.name,
        timestamp: Date.now(),
        genre: settings.genre,
        translations: activePage.translations
      };

      const existingJson = localStorage.getItem('manhua_history');
      let history: HistoryItem[] = existingJson ? JSON.parse(existingJson) : [];
      
      // Remove existing entry with same ID if exists
      history = history.filter(h => h.id !== historyItem.id);
      // Add new one at top
      history.unshift(historyItem);
      // Limit to last 20
      history = history.slice(0, 20);

      localStorage.setItem('manhua_history', JSON.stringify(history));
      setLastSaveTime(Date.now());
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [activePage?.translations, activePage?.id, settings.genre]);

  // --- CORE FUNCTIONS ---

  const processFile = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const pageId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    const newPage: ManhuaPage = {
      id: pageId,
      imageUrl: objectUrl,
      imageFile: file,
      translations: [],
      isAnalyzing: true,
      history: [[]], // Initial empty history
      historyIndex: 0
    };
    
    // Append new page and make it active
    setPages(prev => [...prev, newPage]);
    setActivePageId(pageId);
    setActiveTab('editor'); 

    // Check for user API Key
    const userApiKey = localStorage.getItem('gemini_api_key') || undefined;

    try {
      const translations = await analyzeManhuaPage(file, settings, userApiKey);
      updatePageById(pageId, (p) => ({ 
        ...p, 
        translations, 
        isAnalyzing: false,
        history: [translations], // Reset history to the analyzed result
        historyIndex: 0
      }));
    } catch (error: any) {
      console.error("Analysis failed", error);
      updatePageById(pageId, (p) => ({ ...p, isAnalyzing: false }));
      
      let msg = "خطا در تحلیل تصویر.";
      if (error.message.includes("API Key")) {
        msg = "API Key یافت نشد. لطفا در تنظیمات پروژه، کلید خود را وارد کنید.";
        setActiveTab('settings'); // Switch to settings so they can fix it
      }
      alert(msg);
    }
  }, [settings, updatePageById]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  // Clipboard Paste Button Logic
  const handlePasteClick = async () => {
    try {
      // Check if API is supported
      if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
         throw new Error("Clipboard API not fully supported");
      }

      const items = await navigator.clipboard.read();
      let foundImage = false;
      
      for (const item of items) {
        // Check for image types
        const imageType = item.types.find(t => t.startsWith('image/'));
        
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `Clipboard_${Date.now()}.png`, { type: imageType });
          processFile(file);
          foundImage = true;
          break; 
        }
      }
      
      if (!foundImage) {
        alert("هیچ تصویری در کلیپ‌بورد یافت نشد.");
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      alert("امکان خواندن خودکار کلیپ‌بورد وجود ندارد (محدودیت مرورگر).\nلطفاً روی صفحه کلیک کنید و از کلیدهای Ctrl + V استفاده کنید.");
    }
  };

  // Global Paste Listener (Fallback & Shortcut)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Meta (Mac Command)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        
        if (key === 'e') {
          e.preventDefault();
          setActiveTab('editor');
        } else if (key === 's') {
          e.preventDefault();
          setActiveTab('settings');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleExport = async () => {
    if (pages.length === 0) return;
    // Export all pages in order
    await exportToWord(pages);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    // Create a dummy file because we can't restore File object from LocalStorage
    const dummyFile = new File([""], item.fileName, { type: "image/png" });
    
    const newPage: ManhuaPage = {
      id: Date.now().toString() + "-restored",
      imageUrl: "", // Image is lost on reload, UI handles this
      imageFile: dummyFile,
      translations: item.translations,
      isAnalyzing: false,
      history: [item.translations],
      historyIndex: 0
    };

    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    setSettings(prev => ({ ...prev, genre: item.genre }));
    setShowHistory(false);
  };

  const handleDeletePage = (id: string) => {
    setPages(prev => {
      const newPages = prev.filter(p => p.id !== id);
      if (activePageId === id && newPages.length > 0) {
        setActivePageId(newPages[newPages.length - 1].id);
      } else if (newPages.length === 0) {
        setActivePageId(null);
      }
      return newPages;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-dark text-white">
      
      {/* --- HEADER --- */}
      <header className="bg-surface border-b border-gray-700 h-16 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-secondary w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
            M
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">ManhuaMate <span className="text-primary font-light opacity-80 text-sm">AI</span></h1>
          {pages.length > 1 && (
            <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300 ml-2">
              {pages.length} صفحه
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* Auto-save Indicator */}
          {lastSaveTime && activePage && !activePage.isAnalyzing && (
             <div className="flex items-center gap-1 text-xs text-green-400 ml-4 animate-in fade-in duration-500">
               <CheckCircle2 size={14} />
               <span>ذخیره خودکار</span>
             </div>
          )}

          {/* History Button */}
          <button 
            onClick={() => setShowHistory(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors border border-gray-700"
          >
            <History size={16} />
            <span className="hidden sm:inline">تاریخچه</span>
          </button>

          {pages.length > 0 && (
            <>
               {/* Preview Button */}
               <button 
                 onClick={() => setShowPreview(true)}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors shadow-md"
               >
                 <Eye size={16} />
                 <span className="hidden sm:inline">پیش‌نمایش</span>
               </button>

               {/* Export Button */}
               <button 
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-lg shadow-green-900/20 transition-all"
               >
                 <Download size={18} />
                 {pages.length > 1 ? "دانلود همه" : "دانلود"}
               </button>
            </>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel Container: Page List + Image */}
        <div className="flex-1 bg-gray-900/50 relative flex flex-row border-l border-gray-800 overflow-hidden">
          
          {/* Page Sidebar (Visible if pages exist) */}
          {pages.length > 0 && (
            <PageNavigator 
              pages={pages}
              activePageId={activePageId}
              onSelect={setActivePageId}
              onDelete={handleDeletePage}
              onAdd={processFile}
              onPaste={handlePasteClick}
            />
          )}

          {/* Image Viewer / Drop Zone */}
          <div className="flex-1 relative flex flex-col bg-[#0a0a0a]">
            {!activePage ? (
              // Upload State (Only when NO pages exist)
              pages.length === 0 && (
                <div 
                  className={`flex-1 flex flex-col items-center justify-center m-8 border-2 border-dashed rounded-2xl transition-all duration-200
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-gray-500'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="bg-surface p-6 rounded-full mb-6 shadow-lg animate-pulse">
                    <Upload size={48} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">تصویر مانها را اینجا رها کنید</h2>
                  <p className="text-gray-400 mb-8 text-sm">یا از دکمه‌های زیر استفاده کنید</p>
                  
                  <div className="flex flex-row gap-4">
                      <label className="cursor-pointer">
                        <span className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25 flex items-center gap-2">
                          <ImageIcon size={20} />
                          انتخاب فایل
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                      </label>

                      <button 
                         onClick={handlePasteClick}
                         className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-gray-600 shadow-lg flex items-center gap-2"
                      >
                        <Clipboard size={20} />
                        جایگذاری (Paste)
                      </button>
                  </div>
                  
                  <div className="mt-6 text-xs text-gray-500 font-mono bg-black/20 px-3 py-1 rounded">
                     میانبر: Ctrl + V
                  </div>
                </div>
              )
            ) : (
              // Image View State
              <div className="flex-1 overflow-auto flex items-start justify-center p-4 relative custom-scrollbar">
                 {activePage.imageUrl ? (
                   <img 
                     src={activePage.imageUrl} 
                     alt="Uploaded Manhua" 
                     className="max-w-full h-auto shadow-2xl border border-gray-800"
                   />
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                     <ImageIcon size={64} className="mb-4 text-gray-600"/>
                     <p className="text-lg">تصویر این فایل در دسترس نیست.</p>
                     <p className="text-sm text-gray-600">این صفحه احتمالا از تاریخچه بازیابی شده است.</p>
                   </div>
                 )}
                 
                 {activePage.isAnalyzing && (
                   <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                     <Loader2 size={48} className="text-primary animate-spin mb-4" />
                     <p className="text-xl font-medium">هوش مصنوعی در حال تحلیل صفحه...</p>
                     <p className="text-sm text-gray-400 mt-2">ژانر: {settings.genre}</p>
                   </div>
                 )}
              </div>
            )}

            {/* Drop overlay if dragging over existing image viewer */}
            {pages.length > 0 && isDragging && (
              <div 
                 className="absolute inset-0 bg-primary/20 backdrop-blur-sm border-4 border-primary border-dashed z-30 flex items-center justify-center"
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
              >
                 <div className="bg-surface p-6 rounded-xl shadow-2xl flex flex-col items-center animate-bounce">
                    <Upload size={48} className="text-primary mb-2" />
                    <span className="font-bold text-lg">افزودن صفحه جدید</span>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor & Settings Panel */}
        <div className="w-[450px] bg-surface border-r border-gray-800 flex flex-col shadow-2xl z-10 relative">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-900/50">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                ${activeTab === 'editor' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              title="میانبر: Ctrl+E"
            >
              <FileText size={16} />
              ترجمه‌ها
              {activeTab === 'editor' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                ${activeTab === 'settings' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              title="میانبر: Ctrl+S"
            >
              <Settings size={16} />
              تنظیمات پروژه
              {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* Editor Tab */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              {activePage ? (
                 <Editor 
                   translations={activePage.translations} 
                   onChange={handleTranslationChange}
                   onCommit={handleHistoryCommit}
                   onUndo={handleUndo}
                   onRedo={handleRedo}
                   canUndo={(activePage.historyIndex || 0) > 0}
                   canRedo={(activePage.historyIndex || 0) < (activePage.history?.length || 0) - 1}
                 />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 p-8 text-center">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center mb-4">
                     <FileText size={32} />
                  </div>
                  <p>هنوز ترجمه‌ای موجود نیست.</p>
                  <p className="text-sm mt-2 text-gray-600">لطفا یک فایل بارگذاری کنید یا از تاریخچه انتخاب کنید.</p>
                </div>
              )}
            </div>

            {/* Settings Tab */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'settings' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <SettingsPanel settings={settings} setSettings={setSettings} />
            </div>

            {/* History Panel Overlay */}
            {showHistory && (
              <HistoryPanel 
                onRestore={handleRestoreHistory} 
                onClose={() => setShowHistory(false)} 
              />
            )}

          </div>
          
          {/* Signature Footer */}
          <div className="p-3 bg-black/20 border-t border-gray-800 flex flex-col items-center justify-center gap-1 text-gray-500 select-none">
             <div className="flex items-center gap-1 text-xs">
                <span>ساخته شده توسط</span>
                <span className="text-primary font-bold">Mr.V</span>
             </div>
             <a href="https://github.com/MrV006" target="_blank" rel="noopener noreferrer" className="text-[10px] hover:text-white transition-colors flex items-center gap-1 opacity-60 hover:opacity-100 font-mono">
               <Github size={10} />
               github.com/MrV006
             </a>
          </div>

        </div>

        {/* Word Preview Modal */}
        {showPreview && activePage && (
          <WordPreview 
            page={activePage} 
            onClose={() => setShowPreview(false)} 
            onExport={() => exportToWord([activePage])} // Preview exports only current page usually
          />
        )}

      </main>
    </div>
  );
};

export default App;
