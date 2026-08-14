import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  preventOverlayClose?: boolean;
  preventEscClose?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-[520px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  size = 'md',
  children,
  footer,
  preventOverlayClose = false,
  preventEscClose = false,
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Keep ref for onClose and preventEscClose so effect doesn't re-trigger on parent state changes
  const onCloseRef = useRef(onClose);
  const preventEscCloseRef = useRef(preventEscClose);

  useEffect(() => {
    onCloseRef.current = onClose;
    preventEscCloseRef.current = preventEscClose;
  });

  // --- Lock body scroll, manage initial focus, listen for ESC ---
  useEffect(() => {
    if (!isOpen) return;

    // Save currently focused element ONLY on initial mount/open
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Lock scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // ESC Key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventEscCloseRef.current) {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Restore scroll
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      // Remove listener
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to trigger element when closing
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]); // ONLY re-run when isOpen changes, NOT on every parent render!

  // --- Focus trap ---
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // --- Overlay click handler ---
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!preventOverlayClose && e.target === overlayRef.current) {
        onCloseRef.current();
      }
    },
    [preventOverlayClose]
  );

  const portalRoot = document.getElementById('modal-root');
  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="modal-overlay"
          aria-hidden="true"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onKeyDown={handleTabKey}
            className={`modal-dialog ${sizeClasses[size]} ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  {titleIcon && <span className="text-[var(--color-gold-light)]">{titleIcon}</span>}
                  <h3 id="modal-title" className="font-cinzel text-xl text-[#EAF0E6]">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="modal-close-btn"
                  aria-label="Cerrar"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="modal-body">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
};
