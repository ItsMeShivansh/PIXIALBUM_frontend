import React, { useRef, useEffect, useCallback } from "react";
import "./MobileImageViewer.css";

function MobileImageViewer({
  images = [],
  initialIndex = 0,
  onClose,
  likedImages = new Set(),
  likedImagesOnly = false,
  setLikedImages,
  fetchNextPage,
  hasMorePages,
  page,
}) {
  const imageRefs = useRef([]);
  const scrollContainerRef = useRef();

  // Scroll to the initial image only on mount or when initialIndex changes
  useEffect(() => {
    if (imageRefs.current[initialIndex]) {
      imageRefs.current[initialIndex].scrollIntoView({
        behavior: "instant",
        inline: "center",
        block: "nearest",
      });
    }
    // eslint-disable-next-line
  }, [initialIndex]);

  // Helper to find which image is centered
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) {
      console.log("No scroll container ref");
      return;
    }
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    let closestIdx = 0;
    let minDiff = Infinity;
    imageRefs.current.forEach((el, idx) => {
      if (!el) {
        console.log(`imageRefs[${idx}] is not set`);
        return;
      }
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.left + rect.width / 2 - (containerRect.left + containerRect.width / 2));
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    // If 2nd last image is focused, fetch next page
    if (
      hasMorePages &&
      closestIdx >= images.length - 3 &&
      typeof fetchNextPage === "function"
    ) {
      fetchNextPage();
    }
  }, [images.length, hasMorePages, fetchNextPage]);

  // Attach scroll handler
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ---------------------------    ---------------------------- //
  // Prevent scrolling past the last image
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScrollEnd = () => {
      const lastImg = imageRefs.current[images.length - 1];
      if (!lastImg) return;
      const containerRect = container.getBoundingClientRect();
      const lastImgRect = lastImg.getBoundingClientRect();
      // If the right edge of the last image is left of the container's right edge, snap back
      if (lastImg && typeof lastImg.scrollIntoView === "function" && lastImgRect.right < containerRect.right) {
        lastImg.scrollIntoView({ behavior: "smooth", inline: "end", block: "nearest" });
      }
    };
    container.addEventListener("scroll", handleScrollEnd, { passive: true });
    return () => container.removeEventListener("scroll", handleScrollEnd);
  }, [images.length]);

  // ---------------------------    ---------------------------- //

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div
        className="mobile-image-scroll-container"
        ref={scrollContainerRef}
        onClick={e => e.stopPropagation()}
      >
        {images.map((img, idx) => (
          <div
            className="mobile-image-scroll-item"
            key={img.imageId || idx}
            ref={el => (imageRefs.current[idx] = el)}
            onPointerDown={e => {
              if (e.pointerType === "touch") {
                e.preventDefault();
              }
            }}
          >
            <img
              src={img.rederUrl || img}
              alt={`${idx + 1}`}
              className="image-viewer-img"
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
            <div className="mobile-image-actions">
              <button
                className={`img-like-btn${likedImages.has(img.imageId) ? " liked" : ""}`}
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
              <button
                className="img-download-btn"
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
            </div>
          </div>
        ))}
      </div>
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

export default MobileImageViewer;