import { useEffect } from "react";

let openModalsCount = 0;

const SIZE_CLASS_MAP = {
  sm: "pd-modal--sm",
  md: "pd-modal--md",
  lg: "pd-modal--lg",
  xl: "pd-modal--xl",
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    openModalsCount++;
    document.body.style.overflow = "hidden";

    return () => {
      openModalsCount--;
      if (openModalsCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const sizeClass = SIZE_CLASS_MAP[size] || SIZE_CLASS_MAP.md;

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={closeOnOverlay ? onClose : undefined}>
      <div
        className={`pd-modal ${sizeClass} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal"}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="pd-modal__header">
            {title && <h2 className="pd-modal__title">{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                className="pd-modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        )}

        <div className="pd-modal__body">{children}</div>

        {footer && <div className="pd-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
