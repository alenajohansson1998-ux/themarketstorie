'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import AuthForm, { type AuthMode } from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

/** Sign-in dialog built on the native <dialog> element: focus is trapped and Escape closes it. */
export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      setMode(initialMode);
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, initialMode]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-media border border-line-soft bg-canvas p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface hover:text-ink"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {isOpen ? (
          <AuthForm
            mode={mode}
            onModeChange={setMode}
            headingId={headingId}
            onSuccess={() => {
              onClose();
              window.location.reload();
            }}
          />
        ) : null}
      </div>
    </dialog>
  );
}
