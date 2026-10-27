import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="space-y-1 pr-4">
            <h3 className="text-base font-bold text-stone-900">{title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-red-600/20'
                : 'bg-orange-600 hover:bg-orange-500 active:bg-orange-700 shadow-orange-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
