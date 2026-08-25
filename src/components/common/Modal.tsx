import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-xs p-4 transition-all">
      <div
        className={`relative w-full ${maxWidth} bg-[#111114] text-[#EAEAEA] rounded-2xl shadow-2xl border border-[#26262B] transform transition-all duration-200 ease-out overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26262B] bg-[#16161A]/60">
          <div>
            <h3 className="text-lg font-semibold text-[#EAEAEA] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#88888E] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#88888E] hover:text-[#EAEAEA] hover:bg-[#1C1C21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
