import React, { useRef } from 'react';
import { ManhuaPage } from '../types';
import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PageNavigatorProps {
  pages: ManhuaPage[];
  activePageId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (file: File) => void;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  activePageId,
  onSelect,
  onDelete,
  onAdd
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAdd(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  return (
    <div className="w-24 bg-black/40 border-l border-gray-800 flex flex-col items-center py-4 gap-3 overflow-y-auto custom-scrollbar z-20 shadow-inner">
      {pages.map((page, index) => (
        <div 
          key={page.id} 
          className={`relative group w-16 h-20 rounded-lg transition-all cursor-pointer flex-shrink-0 border-2 shadow-lg
            ${page.id === activePageId ? 'border-primary bg-gray-800 ring-2 ring-primary/30' : 'border-gray-700 hover:border-gray-500'}`}
          onClick={() => onSelect(page.id)}
        >
          {/* Thumbnail */}
          <div className="w-full h-full rounded-md overflow-hidden bg-gray-900 flex items-center justify-center relative">
            {page.imageUrl ? (
              <img 
                src={page.imageUrl} 
                alt={`Page ${index + 1}`} 
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
                loading="lazy"
                decoding="async"
              />
            ) : (
              <ImageIcon size={20} className="text-gray-600" />
            )}
            
            {/* Loading Overlay */}
            {page.isAnalyzing && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                 <Loader2 size={16} className="text-primary animate-spin" />
               </div>
            )}

            {/* Page Number Badge */}
             <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-mono border-t border-l border-gray-700">
               {index + 1}
             </div>
          </div>

          {/* Delete Button (Hover) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-md hover:bg-red-600"
            title="حذف صفحه"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ))}

      {/* Add Button */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="w-12 h-12 rounded-full bg-gray-800/80 hover:bg-primary border border-dashed border-gray-500 hover:border-primary flex items-center justify-center text-gray-400 hover:text-white transition-all mt-2 flex-shrink-0 group"
        title="افزودن صفحه جدید"
      >
        <Plus size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};