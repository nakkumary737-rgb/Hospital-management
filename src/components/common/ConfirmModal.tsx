import React from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, Info } from 'lucide-react';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  options,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !options) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await options.onConfirm();
      onClose();
    } catch (err) {
      console.error('Confirmation action error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    onClose();
  };

  const variant = options.variant || 'danger';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-80 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-slate-800 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              variant === 'danger'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : variant === 'warning'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <Info className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {options.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
              {options.message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCancel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            {options.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all flex items-center gap-1.5 active:scale-95 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                {variant === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
                <span>{options.confirmLabel || 'Confirm Delete'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
