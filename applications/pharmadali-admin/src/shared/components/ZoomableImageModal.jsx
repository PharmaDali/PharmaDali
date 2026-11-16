import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../assets/css/zoomable-image-modal.css";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4.0;
const SCALE_STEP = 0.25;

export function ZoomableImageModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
}) {
  const normalizedImages = (images || []).map((img) =>
    typeof img === "string" ? { url: img, title: "Attachment" } : img
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const viewportRef = useRef(null);

  // Sync initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, normalizedImages.length - 1)));
      resetTransform();
    }
  }, [isOpen, initialIndex, normalizedImages.length]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const resetTransform = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  // Reset transforms whenever changing images
  const handleSelectImage = useCallback((index) => {
    setCurrentIndex(index);
    setImageLoaded(false);
    setImageError(false);
    resetTransform();
  }, [resetTransform]);

  const handlePrev = useCallback(() => {
    if (normalizedImages.length <= 1) return;
    handleSelectImage((currentIndex - 1 + normalizedImages.length) % normalizedImages.length);
  }, [currentIndex, normalizedImages.length, handleSelectImage]);

  const handleNext = useCallback(() => {
    if (normalizedImages.length <= 1) return;
    handleSelectImage((currentIndex + 1) % normalizedImages.length);
  }, [currentIndex, normalizedImages.length, handleSelectImage]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(MAX_SCALE, Number((prev + SCALE_STEP).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(MIN_SCALE, Number((prev - SCALE_STEP).toFixed(2))));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "r" || e.key === "R") {
        resetTransform();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext, resetTransform]);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP;
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((prev + delta).toFixed(2)))));
  };

  // Double click toggles between 1x and 2x
  const handleDoubleClick = () => {
    if (scale !== 1 || position.x !== 0 || position.y !== 0) {
      resetTransform();
    } else {
      setScale(2);
    }
  };

  // Dragging / panning
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only main button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || normalizedImages.length === 0) return null;

  const currentItem = normalizedImages[currentIndex] || normalizedImages[0];
  const isZoomed = scale > 1 || position.x !== 0 || position.y !== 0;

  return (
    <div
      className="pd-zoom-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* Top Header Bar */}
      <div className="pd-zoom-modal-header" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center gap-2 overflow-hidden text-truncate">
          <i className="fa-solid fa-paperclip text-info" style={{ fontSize: "14px" }} />
          <strong className="text-white text-truncate" style={{ fontSize: "14px" }}>
            {currentItem.title || "Order Attachment"}
          </strong>
          {normalizedImages.length > 1 && (
            <span className="badge bg-secondary rounded-pill px-2 py-0.5" style={{ fontSize: "11px" }}>
              {currentIndex + 1} / {normalizedImages.length}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="pd-zoom-btn"
            title="Zoom Out (-)"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
          >
            <i className="fa-solid fa-magnifying-glass-minus" />
          </button>

          <button
            type="button"
            className="pd-zoom-btn px-2 w-auto fw-bold"
            title="Reset Zoom (Double click image)"
            onClick={resetTransform}
            style={{ fontSize: "12px", minWidth: "48px" }}
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            className="pd-zoom-btn"
            title="Zoom In (+)"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
          >
            <i className="fa-solid fa-magnifying-glass-plus" />
          </button>

          <div className="vr bg-white opacity-25 mx-1" style={{ height: "18px" }} />

          <button
            type="button"
            className="pd-zoom-btn"
            title="Rotate 90°"
            onClick={handleRotate}
          >
            <i className="fa-solid fa-rotate-right" />
          </button>

          <button
            type="button"
            className="pd-zoom-btn"
            title="Reset View (R)"
            onClick={resetTransform}
          >
            <i className="fa-solid fa-arrows-rotate" />
          </button>

          <a
            href={currentItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pd-zoom-btn text-decoration-none"
            title="Open original file in new tab"
          >
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "12px" }} />
          </a>

          <div className="vr bg-white opacity-25 mx-1" style={{ height: "18px" }} />

          <button
            type="button"
            className="pd-zoom-btn text-danger-emphasis hover-danger"
            title="Close (Esc)"
            onClick={onClose}
            style={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }}
          >
            <i className="fa-solid fa-xmark" style={{ fontSize: "16px" }} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={viewportRef}
        className={`pd-zoom-viewport ${isZoomed ? "is-zoomed" : ""} ${isDragging ? "is-dragging" : ""}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Navigation Arrows for Multiple Images */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              className="pd-zoom-nav-btn prev"
              title="Previous Attachment (Left Arrow)"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            <button
              type="button"
              className="pd-zoom-nav-btn next"
              title="Next Attachment (Right Arrow)"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </>
        )}

        {/* Loading Spinner */}
        {!imageLoaded && !imageError && (
          <div className="position-absolute d-flex flex-column align-items-center justify-content-center text-white">
            <div className="spinner-border text-info mb-2" role="status" style={{ width: "2.5rem", height: "2.5rem" }} />
            <span style={{ fontSize: "13px" }}>Loading attachment...</span>
          </div>
        )}

        {/* Error Fallback */}
        {imageError && (
          <div className="text-center text-white p-4 bg-dark bg-opacity-75 rounded-4 border border-secondary">
            <i className="fa-solid fa-triangle-exclamation text-warning mb-3" style={{ fontSize: "2.5rem" }} />
            <h6 className="fw-bold mb-1">Failed to load attachment</h6>
            <p className="text-white-50 small mb-3">The attachment could not be rendered.</p>
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-info rounded-pill px-3"
            >
              Open direct link
            </a>
          </div>
        )}

        {/* The Scalable/Draggable Image */}
        <div
          className="pd-zoom-image-container"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
            cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default",
          }}
        >
          <img
            src={currentItem.url}
            alt={currentItem.title || "Order Attachment"}
            className={`pd-zoom-image ${isDragging ? "no-transition" : ""}`}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              display: imageError ? "none" : "block",
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setImageError(true);
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Thumbnails Strip (if multiple attachments) */}
      {normalizedImages.length > 1 && (
        <div className="pd-zoom-footer-thumbnails" onClick={(e) => e.stopPropagation()}>
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`pd-zoom-thumb ${idx === currentIndex ? "active" : ""}`}
              onClick={() => handleSelectImage(idx)}
              title={img.title || `Attachment ${idx + 1}`}
            >
              <img src={img.url} alt={img.title || `Thumb ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ZoomableImageModal;
