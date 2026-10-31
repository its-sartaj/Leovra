import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPasscode: (emailOrPhone: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onSendPasscode
}) => {
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendPasscode(inputVal.trim());
    setInputVal('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in touch-pan"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white max-w-sm w-full p-6 shadow-2xl relative rounded-none animate-scale-in gpu-smooth"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-black active:scale-90 transition-all cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-1">
          <User className="w-5 h-5 text-black" />
          <h3 className="text-base font-bold text-[#121212]">Customer Account</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Enter your email or phone to receive a secure login link or look up your order history.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            required
            autoFocus
            aria-label="Email address or phone number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="name@example.com or phone"
            className="w-full p-2.5 border border-gray-300 text-xs mb-3 outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            Send Login Link
          </button>
        </form>
      </div>
    </div>
  );
};
