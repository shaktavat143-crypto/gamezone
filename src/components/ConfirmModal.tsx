import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          btnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
        };
      default:
        return {
          iconBg: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
          btnBg: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/30'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-8">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
            {icon || <AlertTriangle className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="h-11 min-h-[44px] px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`h-11 min-h-[44px] px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer ${styles.btnBg}`}
          >
            <Check className="h-4 w-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
