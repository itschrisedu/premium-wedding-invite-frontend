import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Visual variant for the confirm button */
  variant?: 'danger' | 'warning' | 'default';
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
}

const variantClasses: Record<string, string> = {
  danger: 'bg-rose-500 hover:bg-rose-600',
  warning: 'bg-[var(--color-gold-dark)] hover:bg-[var(--color-accent-hover)]',
  default: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleIcon={<AlertTriangle className="w-5 h-5" />}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50 ${variantClasses[variant]}`}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-[#EAF0E6]/90 font-sans leading-relaxed">{message}</p>
    </Modal>
  );
};
