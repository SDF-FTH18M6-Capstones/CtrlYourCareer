import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import "./Modal.css";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "medium",
  busy = false,
}) {
  const titleId = useId();

  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  // Keep the latest callback and busy state without
  // restarting the modal's focus-management effect.
  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  }, [onClose, busy]);

  // Close the modal only when it is not saving.
  function handleClose() {
    if (!busyRef.current) {
      onCloseRef.current?.();
    }
  }

  // Manage focus only when the modal opens or closes.
  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    // Focus the first editable field when opening.
    const firstInput = dialogRef.current?.querySelector(
      'input:not([disabled]):not([type="hidden"]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])',
    );

    if (firstInput) {
      firstInput.focus();
    } else if (closeRef.current && !closeRef.current.disabled) {
      closeRef.current.focus();
    } else {
      dialogRef.current?.focus();
    }

    function handleKeyDown(event) {
      // Close using Escape unless a save is in progress.
      if (event.key === "Escape") {
        event.preventDefault();

        if (!busyRef.current) {
          onCloseRef.current?.();
        }

        return;
      }

      // Keep keyboard navigation inside the modal.
      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll(
            'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          ) || [],
        ).filter(
          (element) =>
            element.tabIndex >= 0 && element.getClientRects().length > 0,
        );

        if (!focusable.length) {
          event.preventDefault();
          dialogRef.current?.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement;

        if (!focusable.includes(activeElement)) {
          event.preventDefault();

          if (event.shiftKey) {
            last.focus();
          } else {
            first.focus();
          }

          return;
        }

        if (event.shiftKey && activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus to the button that opened the modal.
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="cyc-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={`cyc-modal cyc-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy}
        tabIndex={-1}
      >
        <header className="cyc-modal-header">
          <h2 id={titleId}>{title}</h2>

          <button
            ref={closeRef}
            type="button"
            className="cyc-modal-close"
            onClick={handleClose}
            aria-label="Close popup"
            disabled={busy}
          >
            <X size={20} />
          </button>
        </header>

        <div className="cyc-modal-body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
