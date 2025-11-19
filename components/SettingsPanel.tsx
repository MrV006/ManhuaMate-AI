
import React, { useState, useEffect } from 'react';
import { ManhuaGenre, GlossaryEntry, ProjectSettings } from '../types';
import { Book, Plus, Trash2, Save, Search, Key, Eye, EyeOff, Check, Cpu, Star, ShieldCheck, Edit2, X } from 'lucide-react';

interface SettingsPanelProps {
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
}

interface SavedKey {
  alias: string;
  key: string;
  addedAt: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [newTerm, setNewTerm] = useState('');
  const [newTrans, setNewTrans] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Glossary Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{term: string, trans: string}>({term: '', trans: ''});
  
  // API Key Management State
  const [activeKey, setActiveKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [inputAlias, setInputAlias] = useState('');
  const [showInputKey, setShowInputKey] = useState(false);
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);

  useEffect(() => {
    // Load active key
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setActiveKey(storedKey);

    // Load saved keys
    const storedSavedKeys = localStorage.getItem('saved_api_keys');
    if (storedSavedKeys) {
      try {
        setSavedKeys(JSON.parse(storedSavedKeys));
      } catch (e) {
        console.error("Failed to parse saved keys", e);
      }
    }
  }, []);

  const handleAddKey = () => {
    if (!inputKey.trim()) return;

    const newKeyEntry: SavedKey = {
      alias: inputAlias.trim() || `Key ${savedKeys.length + 1}`,
      key: inputKey.trim(),
      addedAt: Date.now()
    };

    const updatedKeys = [...savedKeys, newKeyEntry];
    setSavedKeys(updatedKeys);
    localStorage.setItem('saved_api_keys', JSON.stringify(updatedKeys));

    // If no active key, set this one as active
    if (!activeKey) {
      setActiveKey(newKeyEntry.key);
      localStorage.setItem('gemini_api_key', newKeyEntry.key);
    }

    setInputKey('');
    setInputAlias('');
  };

  const handleSelectKey = (key: string) => {
    setActiveKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleDeleteKey = (keyToDelete: string) => {
    const updatedKeys = savedKeys.filter(k => k.key !== keyToDelete);
    setSavedKeys(updatedKeys);
    localStorage.setItem('saved_api_keys', JSON.stringify(updatedKeys));

    if (activeKey === keyToDelete) {
      setActiveKey('');
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Glossary Functions
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

  const handleStartEdit = (entry: GlossaryEntry) => {
    setEditingId(entry.id);
    setEditValues({ term: entry.term, trans: entry.translation });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ term: '', trans: '' });
  };

  const handleSaveEdit = (id: string) => {
    if (!editValues.term.trim() || !editValues.trans.trim()) return;

    setSettings(prev => ({
      ...prev,
      glossary: prev.glossary.map(g => 
        g.id === id 
        ? { ...g, term: editValues.term.trim(), translation: editValues.trans.trim() } 
        : g
      )
    }));
    setEditingId(null);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, genre: e.target.value as ManhuaGenre }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, selectedModel: e.target.value }));
  };

  // Filter Logic
  const filteredGlossary = settings.glossary.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.translation.includes(searchQuery)
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 text-right" dir="rtl">
      
      {/* Model Selection Section */}
      <section className="bg-surface p-4 rounded-lg border border-blue-500/30 shadow-lg shadow-blue-900/10">
         <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Cpu size={20} />
            <h3 className="font-bold">مدل هوش مصنوعی</h3>
         </div>
         <p className="text-xs text-gray-400 mb-3">
           انتخاب مدل مناسب می‌تواند بر کیفیت و سرعت ترجمه تاثیر بگذارد.
         </p>
         <select 
            value={settings.selectedModel || 'gemini-2.5-flash'}
            onChange={handleModelChange}
            className="w-full bg-dark border border-gray-600 rounded p-2 text-white text-sm focus:border-blue-500 focus:outline-none mb-2"
         >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (سریع و بهینه - پیشنهادی)</option>
            <option value="gemini-3-pro-preview">Gemini 3.0 Pro (دقیق‌تر و هوشمندتر - کندتر)</option>
         </select>
         <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <Star size={10} className="text-yellow-500" />
            مدل Flash برای اکثر مانها‌ها کافی است. اگر متن‌های پیچیده (مثل Wuxia) دارید، از Pro استفاده کنید.
         </div>
      </section>

      {/* API Key Management Section */}
      <section className="bg-surface p-4 rounded-lg border border-indigo-500/30 shadow-lg shadow-indigo-900/10">
        <div className="flex items-center gap-2 mb-3 text-indigo-400">
          <Key size={20} />
          <h3 className="font-bold">مدیریت کلیدهای API</h3>
        </div>
        
        {/* Add New Key */}
        <div className="bg-dark/30 p-3 rounded-lg mb-4 border border-gray-700/50">
           <p className="text-xs text-gray-400 mb-2 font-bold">افزودن کلید جدید:</p>
           <div className="space-y-2">
             <div className="relative">
                <input 
                  type={showInputKey ? "text" : "password"}
                  placeholder="کلید API (AIzaSy...)"
                  className="w-full bg-dark border border-gray-600 rounded p-2 pl-10 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono text-left"
                  dir="ltr"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                />
                <button 
                  onClick={() => setShowInputKey(!showInputKey)}
                  className="absolute top-2.5 left-3 text-gray-500 hover:text-white"
                >
                  {showInputKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="نام مستعار (مثلاً: کلید شخصی)"
                  className="flex-1 bg-dark border border-gray-600 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={inputAlias}
                  onChange={(e) => setInputAlias(e.target.value)}
                />
                <button 
                  onClick={handleAddKey}
                  disabled={!inputKey}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded text-xs transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> افزودن
                </button>
             </div>
           </div>
        </div>

        {/* List of Keys */}
        <div className="space-y-2">
           {savedKeys.length === 0 && (
              <div className="text-center text-gray-600 text-xs py-2 italic">
                 هیچ کلیدی ذخیره نشده است.
              </div>
           )}
           {savedKeys.map((k) => {
             const isActive = k.key === activeKey;
             return (
               <div key={k.key} className={`flex items-center justify-between p-3 rounded border transition-colors ${isActive ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-dark/50 border-gray-700'}`}>
                 <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2">
                       <span className={`font-bold text-sm truncate ${isActive ? 'text-indigo-300' : 'text-gray-300'}`}>{k.alias}</span>
                       {isActive && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1"><ShieldCheck size={10}/> فعال</span>}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono text-left dir-ltr truncate max-w-[200px]" dir="ltr">
                       {k.key.substring(0, 8)}...{k.key.substring(k.key.length - 4)}
                    </span>
                 </div>
                 <div className="flex gap-2 shrink-0">
                    {!isActive && (
                      <button 
                        onClick={() => handleSelectKey(k.key)}
                        className="text-gray-400 hover:text-indigo-400 text-xs border border-gray-700 hover:border-indigo-500 px-2 py-1 rounded transition-colors"
                      >
                        انتخاب
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteKey(k.key)}
                      className="text-gray-500 hover:text-red-500 p-1.5 rounded transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
               </div>
             );
           })}
        </div>
      </section>

      {/* Genre Section */}
      <section className="bg-surface p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Book size={20} />
          <h3 className="font-bold">سبک و ژانر (Context)</h3>
        </div>
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
          {filteredGlossary.map(item => {
            const isEditing = item.id === editingId;
            return (
              <div key={item.id} className={`flex items-center justify-between p-2 rounded border text-sm transition-colors group
                 ${isEditing ? 'bg-dark/80 border-secondary' : 'bg-dark/50 border-gray-800 hover:border-gray-600'}`}>
                
                {isEditing ? (
                  // Edit Mode
                  <div className="flex gap-2 w-full items-center">
                     <input 
                       className="flex-1 bg-black border border-gray-600 rounded px-2 py-1 text-xs focus:border-secondary focus:outline-none"
                       value={editValues.trans}
                       onChange={(e) => setEditValues(prev => ({...prev, trans: e.target.value}))}
                       placeholder="ترجمه"
                     />
                     <input 
                       className="flex-1 bg-black border border-gray-600 rounded px-2 py-1 text-xs focus:border-secondary focus:outline-none text-left"
                       value={editValues.term}
                       onChange={(e) => setEditValues(prev => ({...prev, term: e.target.value}))}
                       placeholder="Term"
                       dir="ltr"
                     />
                     <div className="flex gap-1">
                       <button onClick={() => handleSaveEdit(item.id)} className="text-green-500 hover:bg-green-900/30 p-1 rounded"><Check size={14} /></button>
                       <button onClick={handleCancelEdit} className="text-red-500 hover:bg-red-900/30 p-1 rounded"><X size={14} /></button>
                     </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex gap-2 overflow-hidden flex-1">
                       <span className="text-gray-200 truncate">{item.translation}</span>
                       <span className="text-gray-500 text-xs flex items-center truncate">({item.term})</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                        title="ویرایش"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleRemoveGlossary(item.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
