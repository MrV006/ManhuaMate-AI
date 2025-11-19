
import React, { useEffect, useState } from 'react';
import { HistoryItem } from '../types';
import { Clock, FileText, Trash2, RefreshCw, X, AlertTriangle } from 'lucide-react';

interface HistoryPanelProps {
  onRestore: (item: HistoryItem) => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onRestore, onClose }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('manhua_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('manhua_history', JSON.stringify(newHistory));
  };

  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('fa-IR', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(ts));
  };

  return (
    <div className="absolute inset-0 bg-surface z-30 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
             <Clock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">تاریخچه ترجمه‌ها</h3>
            <p className="text-xs text-gray-400">۲۰ فایل اخیر شما</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
            <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                <Clock size={32} className="opacity-50"/>
            </div>
            <p>هنوز هیچ ترجمه‌ای ذخیره نشده است.</p>
            <p className="text-xs mt-2 text-gray-600">ترجمه‌های شما هنگام کار به صورت خودکار ذخیره می‌شوند.</p>
          </div>
        ) : (
          history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
            <div key={item.id} className="bg-dark p-4 rounded-xl border border-gray-700 hover:border-primary/50 transition-all group relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="bg-gray-800 p-2 rounded text-blue-400">
                     <FileText size={18} />
                   </div>
                   <div className="min-w-0">
                       <div className="font-bold text-sm truncate dir-ltr text-left text-white" dir="ltr">{item.fileName}</div>
                       <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{item.genre.split('/')[0]}</span>
                          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          <span>{formatTime(item.timestamp)}</span>
                       </div>
                   </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between relative z-10 mt-4">
                 <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
                   {item.translations.length} خط ترجمه
                 </span>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => onRestore(item)}
                      className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                    >
                      <RefreshCw size={14} />
                      بازیابی
                    </button>
                 </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-yellow-900/20 border-t border-yellow-900/30 text-xs text-yellow-500 flex items-center gap-2 justify-center">
         <AlertTriangle size={14} />
         توجه: تصاویر در تاریخچه ذخیره نمی‌شوند، فقط متن‌ها.
      </div>
    </div>
  );
};
