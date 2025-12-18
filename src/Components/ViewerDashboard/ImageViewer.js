import React, { useEffect, useState, useRef } from "react";
import "./ImageViewer.css";

function ImageViewer({
  images = [],
  initialIndex = 0,
  onClose,
  likedImages = new Set(),
  likedImagesOnly = false,
  setLikedImages,
  fetchNextPage,
  hasMorePages,
}) {
  const [current, setCurrent] = useState(initialIndex);
  const [animation, setAnimation] = useState(""); // "slide-left" or "slide-right"

  // Touch swipe refs
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Fetch next page if user is on the 2nd last image
  useEffect(() => {
    if (
      hasMorePages &&
      images.length > 1 &&
      current >= images.length - 3
    ) {
      fetchNextPage();
    }
  }, [current, images.length, hasMorePages, fetchNextPage]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  const goToPrev = () => {
    setAnimation("slide-right");
    setTimeout(() => {
      setCurrent(c => (c - 1 + images.length) % images.length);
      setAnimation("");
    }, 300); // match animation duration
  };

  const goToNext = () => {
    setAnimation("slide-left");
    setTimeout(() => {
      setCurrent(c => (c + 1) % images.length);
      setAnimation("");
    }, 300);
  };

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchEndX.current - touchStartX.current;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!images.length) return null;

  const img = images[current];

  return (
    <div
      className="image-viewer-overlay"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="image-viewer-arrow left"
        onClick={e => {
          e.stopPropagation();
          goToPrev();
        }}
        aria-label="Previous"
      >
        &#60;
      </button>
      <div className={`image-wrapper ${animation}`}>
        <img
          src={img.rederUrl || img}
          alt={`Image ${current + 1}`}
          className={`image-viewer-img ${animation}`}
          onClick={e => e.stopPropagation()}
        />
        {/* Download Button */}
        <button
          className="gallery-img-download-btn"
          title="Download"
          onClick={e => {
            e.stopPropagation();
            const link = document.createElement("a");
            link.href = img.dowloadUrl || img;
            link.download = `image.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <i className="fa-solid fa-download"></i>
        </button>
        {/* Like Button */}
        <button
          className={`gallery-img-like-btn${likedImages.has(img.imageId) ? " liked" : ""}`}
          title={likedImages.has(img.imageId) ? "Unlike" : "Like"}
          onClick={e => {
            e.stopPropagation();
            if (!setLikedImages) return;
            setLikedImages(prev => {
              const newSet = new Set(prev);
              if (newSet.has(img.imageId)) {
                newSet.delete(img.imageId);
              } else {
                newSet.add(img.imageId);
              }
              return newSet;
            });
          }}
        >
          <i className={likedImages.has(img.imageId) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
        </button>
      </div>
      <button
        className="image-viewer-arrow right"
        onClick={e => {
          e.stopPropagation();
          goToNext();
        }}
        aria-label="Next"
      >
        &#62;
      </button>
      <span
        className="image-viewer-close"
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        title="Close"
      >
        &times;
      </span>
    </div>
  );
}

export default ImageViewer;