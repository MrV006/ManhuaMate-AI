
import React, { useState, useEffect } from 'react';
import { ManhuaGenre, GlossaryEntry, ProjectSettings } from '../types';
import { Book, Plus, Trash2, Save, Search, Key, Eye, EyeOff, Check } from 'lucide-react';

interface SettingsPanelProps {
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [newTerm, setNewTerm] = useState('');
  const [newTrans, setNewTrans] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setKeySaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setKeySaved(true);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setKeySaved(false);
  };

  const handleAddGlossary = () => {
    if (!newTerm.trim() || !newTrans.trim()) return;
    
    const newEntry: GlossaryEntry = {
      id: Date.now().toString(),
      term: newTerm.trim(),
      translation: newTrans.trim()
    };

    setSettings(prev => ({
      ...prev,
      glossary: [...prev.glossary, newEntry]
    }));
    
    setNewTerm('');
    setNewTrans('');
  };

  const handleRemoveGlossary = (id: string) => {
    setSettings(prev => ({
      ...prev,
      glossary: prev.glossary.filter(g => g.id !== id)
    }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, genre: e.target.value as ManhuaGenre }));
  };

  // Filter Logic
  const filteredGlossary = settings.glossary.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.translation.includes(searchQuery)
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 text-right" dir="rtl">
      
      {/* API Key Section */}
      <section className="bg-surface p-4 rounded-lg border border-indigo-500/30 shadow-lg shadow-indigo-900/10">
        <div className="flex items-center gap-2 mb-3 text-indigo-400">
          <Key size={20} />
          <h3 className="font-bold">تنظیمات API Key</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          کلید اختصاصی Gemini خود را اینجا وارد کنید. این کلید فقط در مرورگر شما ذخیره می‌شود.
        </p>
        
        <div className="relative mb-3">
          <input 
            type={showKey ? "text" : "password"}
            placeholder="AIzaSy..."
            className="w-full bg-dark border border-gray-600 rounded p-2 pl-10 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono text-left"
            dir="ltr"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setKeySaved(false);
            }}
          />
          <button 
            onClick={() => setShowKey(!showKey)}
            className="absolute top-2.5 left-3 text-gray-500 hover:text-white"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          {keySaved && (
             <span className="flex items-center gap-1 text-xs text-green-400 ml-auto self-center">
                <Check size={14} /> ذخیره شد
             </span>
          )}
          {keySaved ? (
            <button 
              onClick={handleClearKey}
              className="bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded text-xs transition-colors border border-red-900/50"
            >
              حذف کلید
            </button>
          ) : (
            <button 
              onClick={handleSaveKey}
              disabled={!apiKey}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs transition-colors"
            >
              ذخیره در حافظه
            </button>
          )}
        </div>
      </section>

      {/* Genre Section */}
      <section className="bg-surface p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Book size={20} />
          <h3 className="font-bold">سبک و ژانر (Context)</h3>
        </div>
        <p className="text-xs text-gray-400 mb-2">انتخاب ژانر صحیح به هوش مصنوعی کمک می‌کند تا لحن مناسب (تاریخی، لات، رسمی) را انتخاب کند.</p>
        <select 
          value={settings.genre} 
          onChange={handleGenreChange}
          className="w-full bg-dark border border-gray-600 rounded p-2 text-white focus:border-primary focus:outline-none"
        >
          {Object.values(ManhuaGenre).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </section>

      {/* Glossary Section */}
      <section className="bg-surface p-4 rounded-lg border border-gray-700 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-secondary">
          <Save size={20} />
          <h3 className="font-bold">واژه‌نامه تخصصی (Glossary)</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          کلمات خاص (نام‌ها، رتبه‌ها) را اینجا وارد کنید تا در ترجمه رعایت شوند.
        </p>

        {/* Add New Term */}
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="اصطلاح اصلی (انگلیسی)" 
            className="flex-1 bg-dark border border-gray-600 rounded p-2 text-xs focus:border-secondary focus:outline-none"
            value={newTerm}
            onChange={e => setNewTerm(e.target.value)}
            dir="ltr"
          />
          <input 
            type="text" 
            placeholder="ترجمه ثابت فارسی" 
            className="flex-1 bg-dark border border-gray-600 rounded p-2 text-xs focus:border-secondary focus:outline-none"
            value={newTrans}
            onChange={e => setNewTrans(e.target.value)}
          />
          <button 
            onClick={handleAddGlossary}
            className="bg-secondary hover:bg-secondary/80 p-2 rounded text-white transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <input 
            type="text"
            placeholder="جستجوی سریع برای واژه‌نامه..."
            className="w-full bg-dark/50 border border-gray-600 rounded p-2 pr-9 text-xs text-white focus:outline-none focus:border-primary placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={14} className="absolute top-2.5 right-3 text-gray-400" />
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {filteredGlossary.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-4 italic border border-dashed border-gray-700 rounded">
              {searchQuery ? 'موردی یافت نشد.' : 'هنوز واژه‌ای اضافه نشده است.'}
            </div>
          )}
          {filteredGlossary.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-dark/50 p-2 rounded border border-gray-800 text-sm group hover:border-gray-600 transition-colors">
              <div className="flex gap-2 overflow-hidden">
                 <span className="text-gray-200 truncate">{item.translation}</span>
                 <span className="text-gray-500 text-xs flex items-center truncate">({item.term})</span>
              </div>
              <button 
                onClick={() => handleRemoveGlossary(item.id)}
                className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
