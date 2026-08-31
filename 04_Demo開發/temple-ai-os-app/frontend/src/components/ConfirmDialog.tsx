import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmTone = "danger" | "primary";

type ConfirmDialogRequest = {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  icon?: ReactNode;
};

type ActiveConfirmDialog = ConfirmDialogRequest & {
  resolve: (confirmed: boolean) => void;
};

export function useConfirmDialog() {
  const [activeRequest, setActiveRequest] = useState<ActiveConfirmDialog | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  const closeDialog = useCallback((confirmed: boolean) => {
    setActiveRequest((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  const requestConfirmation = useCallback((request: ConfirmDialogRequest) => {
    return new Promise<boolean>((resolve) => {
      setActiveRequest((current) => {
        current?.resolve(false);
        return { ...request, resolve };
      });
    });
  }, []);

  useEffect(() => {
    if (!activeRequest || typeof document === "undefined") {
      return undefined;
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => cancelButtonRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [activeRequest, closeDialog]);

  const tone = activeRequest?.tone || "danger";
  const confirmDialog = activeRequest ? (
    <div
      className="confirm-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeDialog(false);
        }
      }}
    >
      <section
        className={`confirm-dialog ${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <div className="confirm-dialog-icon">
          {activeRequest.icon || <AlertTriangle size={24} />}
        </div>
        <button className="confirm-dialog-close" type="button" aria-label="關閉確認視窗" onClick={() => closeDialog(false)}>
          <X size={18} />
        </button>
        <div className="confirm-dialog-copy">
          <h2 id={titleId}>{activeRequest.title}</h2>
          <p id={bodyId}>{activeRequest.body}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button className="button" type="button" ref={cancelButtonRef} onClick={() => closeDialog(false)}>
            {activeRequest.cancelLabel || "取消"}
          </button>
          <button className={`button ${tone === "danger" ? "danger" : "primary"}`} type="button" onClick={() => closeDialog(true)}>
            {activeRequest.confirmLabel || "確認"}
          </button>
        </div>
      </section>
    </div>
  ) : null;

  return { requestConfirmation, confirmDialog };
}
