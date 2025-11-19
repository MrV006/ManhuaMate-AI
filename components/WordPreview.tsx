
import React from 'react';
import { ManhuaPage } from '../types';
import { X, Download, FileText } from 'lucide-react';

interface WordPreviewProps {
  page: ManhuaPage;
  onClose: () => void;
  onExport: () => void;
}

export const WordPreview: React.FC<WordPreviewProps> = ({ page, onClose, onExport }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white text-black w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-100 border-b px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-800">پیش‌نمایش فایل Word</h2>
              <p className="text-sm text-gray-500">{page.imageFile.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Download size={18} />
              دانلود فایل نهایی
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Document Simulation */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-8">
          <div className="max-w-[210mm] mx-auto bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] min-h-[297mm] p-[25mm] text-right origin-top" dir="rtl">
            
            {/* Doc Title */}
            <h1 className="text-center font-bold text-lg mb-8 text-gray-800 pb-4 border-b border-gray-300">
              {page.imageFile.name}
            </h1>

            {/* Plain Text Content */}
            <div className="space-y-6">
              {page.translations.map((t) => (
                <div key={t.id}>
                  <p className="font-['Vazirmatn'] text-lg leading-loose text-black">
                    {t.translatedText}
                  </p>
                  {/* Visual spacer */}
                  <div className="h-4"></div> 
                </div>
              ))}
            </div>

            {/* Footer Simulation */}
            <div className="mt-12 text-center text-gray-400 text-xs border-t pt-4 flex flex-col gap-1">
              <span>Created by ManhuaMate AI</span>
              <span className="text-[10px] opacity-70">Dev: Mr.V (github.com/MrV006)</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
