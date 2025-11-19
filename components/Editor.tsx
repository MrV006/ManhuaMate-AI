import React from 'react';
import { TranslationItem, TranslationType, ToneType } from '../types';
import { Trash2, MessageSquare, Zap, Cloud, Volume2, Mic } from 'lucide-react';

interface EditorProps {
  translations: TranslationItem[];
  setTranslations: React.Dispatch<React.SetStateAction<TranslationItem[]>>;
}

const TypeIcon = ({ type }: { type: TranslationType }) => {
  switch (type) {
    case TranslationType.BUBBLE: return <MessageSquare size={16} className="text-blue-400" />;
    case TranslationType.SFX: return <Zap size={16} className="text-yellow-400" />;
    case TranslationType.THOUGHT: return <Cloud size={16} className="text-gray-400" />;
    case TranslationType.NARRATION: return <Mic size={16} className="text-green-400" />;
    default: return <Volume2 size={16} className="text-purple-400" />;
  }
};

export const Editor: React.FC<EditorProps> = ({ translations, setTranslations }) => {

  const handleTextChange = (id: number, newText: string) => {
    setTranslations(prev => prev.map(t => t.id === id ? { ...t, translatedText: newText } : t));
  };

  const handleToneChange = (id: number, newTone: string) => {
     setTranslations(prev => prev.map(t => t.id === id ? { ...t, tone: newTone as ToneType } : t));
  };

  const handleDelete = (id: number) => {
    setTranslations(prev => prev.filter(t => t.id !== id));
  };

  if (translations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
        <MessageSquare size={48} className="mb-4" />
        <p>هنوز ترجمه‌ای موجود نیست. لطفا تصویری بارگذاری کنید.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
      {translations.map((item) => (
        <div key={item.id} className="bg-surface p-4 rounded-lg border border-gray-700 shadow-sm hover:border-primary transition-colors group">
          
          {/* Header: ID, Type, Original Text Preview */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 text-gray-300 text-xs font-mono px-2 py-1 rounded">#{item.id}</span>
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                <TypeIcon type={item.type} />
                <span>{item.type}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="حذف"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Original Text (Small) */}
          <div className="mb-2 text-xs text-gray-500 font-mono text-left" dir="ltr">
             {item.originalText}
          </div>

          {/* Editable Persian Text */}
          <textarea
            className="w-full bg-dark border border-gray-700 rounded p-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-y min-h-[80px] leading-relaxed"
            value={item.translatedText}
            onChange={(e) => handleTextChange(item.id, e.target.value)}
            placeholder="ترجمه فارسی..."
            dir="rtl"
          />

          {/* Tone Selector & Notes */}
          <div className="flex gap-2 mt-3">
             <select 
              value={item.tone}
              onChange={(e) => handleToneChange(item.id, e.target.value)}
              className="bg-gray-800 text-xs text-gray-300 border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-primary"
             >
               {Object.values(ToneType).map(tone => (
                 <option key={tone} value={tone}>{tone}</option>
               ))}
             </select>

             {item.notes && (
               <div className="flex-1 text-xs text-yellow-500/80 flex items-center px-2 bg-yellow-900/10 rounded border border-yellow-900/20">
                 💡 {item.notes}
               </div>
             )}
          </div>

        </div>
      ))}
    </div>
  );
};
