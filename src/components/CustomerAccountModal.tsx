import React, { useState } from 'react';
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
  if (!isOpen) return null;

  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendPasscode(inputVal.trim());
    setInputVal('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-sm w-full p-6 shadow-xl relative rounded-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
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
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="name@example.com or phone"
            className="w-full p-2.5 border border-gray-300 text-xs mb-3 outline-none focus:border-black"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            Send Login Link
          </button>
        </form>
      </div>
    </div>
  );
};
