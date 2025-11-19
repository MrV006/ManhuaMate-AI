
import React, { useEffect } from 'react';
import { TranslationItem, TranslationType, ToneType } from '../types';
import { Trash2, MessageSquare, Zap, Cloud, Volume2, Mic, Undo2, Redo2 } from 'lucide-react';

interface EditorProps {
  translations: TranslationItem[];
  onChange: (newTranslations: TranslationItem[]) => void;
  onCommit: () => void; // Saves current state to history
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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

export const Editor: React.FC<EditorProps> = ({ 
  translations, 
  onChange, 
  onCommit,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        // Don't interfere with native browser undo/redo in input fields
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;

        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) onRedo();
        } else {
          if (canUndo) onUndo();
        }
      }
      // Handle Ctrl+Y for Redo on Windows
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
         const activeTag = document.activeElement?.tagName;
         if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;
         
         e.preventDefault();
         if (canRedo) onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  const handleTextChange = (id: number, newText: string) => {
    const updated = translations.map(t => t.id === id ? { ...t, translatedText: newText } : t);
    onChange(updated);
  };

  const handleToneChange = (id: number, newTone: string) => {
     const updated = translations.map(t => t.id === id ? { ...t, tone: newTone as ToneType } : t);
     onChange(updated);
     // Commit immediately for non-text changes
     setTimeout(onCommit, 0);
  };

  const handleDelete = (id: number) => {
    const updated = translations.filter(t => t.id !== id);
    onChange(updated);
    // Commit immediately for deletes
    setTimeout(onCommit, 0);
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
    <div className="h-full flex flex-col">
      
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between bg-gray-900/30 shrink-0">
         <div className="flex items-center gap-2">
           <button 
             onClick={onUndo}
             disabled={!canUndo}
             className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs
               ${canUndo ? 'hover:bg-gray-700 text-gray-300' : 'opacity-30 cursor-not-allowed text-gray-500'}`}
             title="برگشت (Ctrl+Z)"
           >
             <Undo2 size={16} />
           </button>
           <button 
             onClick={onRedo}
             disabled={!canRedo}
             className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs
               ${canRedo ? 'hover:bg-gray-700 text-gray-300' : 'opacity-30 cursor-not-allowed text-gray-500'}`}
             title="بازگشت مجدد (Ctrl+Shift+Z)"
           >
             <Redo2 size={16} />
           </button>
         </div>
         <div className="text-xs text-gray-500">
            {translations.length} آیتم
         </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
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
              onBlur={onCommit} // Commit to history when focus leaves
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
    </div>
  );
};
