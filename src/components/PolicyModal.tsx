import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  title,
  content
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white max-w-lg w-full my-auto rounded-none shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          aria-label="Close policy modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-black" />
          <h3 className="text-lg font-bold text-[#121212]">{title}</h3>
        </div>

        <div
          className="text-xs text-gray-600 leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-1"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <button
          onClick={onClose}
          className="mt-6 w-full bg-black text-white py-2.5 text-xs uppercase font-semibold tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
