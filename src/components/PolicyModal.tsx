import React, { useEffect } from 'react';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto animate-fade-in touch-pan"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white max-w-lg w-full my-auto rounded-none shadow-2xl p-6 sm:p-8 relative animate-scale-in gpu-smooth"
      >
        <button
          onClick={onClose}
          aria-label="Close policy modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-black active:scale-90 transition-all cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-black" />
          <h3 className="text-lg font-bold text-[#121212]">{title}</h3>
        </div>

        <div
          className="text-xs text-gray-600 leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-1 touch-pan"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <button
          onClick={onClose}
          className="mt-6 w-full bg-black text-white py-2.5 text-xs uppercase font-semibold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
