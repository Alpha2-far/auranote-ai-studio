import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Largeur max en classe Tailwind (défaut max-w-md). */
  widthClass?: string;
}

/** Fenêtre modale intégrée (remplace les dialogues natifs prompt/alert/confirm). */
export function Modal({ open, onClose, title, children, widthClass = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} className="text-[var(--text-soft)] hover:text-[var(--text)]">
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation intégrée (remplace window.confirm). */
export function ConfirmDialog({
  open,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-4 text-sm text-[var(--text-soft)]">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            danger
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-brand-500 text-[#0D0F12] hover:bg-brand-600'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
