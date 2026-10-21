'use client';

import { useEffect, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';

/**
 * Closes a menu, popover or panel when the pointer goes down outside `ref`
 * or the Escape key is pressed.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: (reason: 'outside' | 'escape') => void
) {
  useEffect(() => {
    if (!open) return;

    function handlePointer(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose('outside');
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose('escape');
      }
    }

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, open, onClose]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab and Shift+Tab inside `container`. Call from a keydown handler. */
export function trapFocus(event: KeyboardEvent | ReactKeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab' || !container) return;
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Locks page scroll while a full-screen sheet or dialog is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [locked]);
}
