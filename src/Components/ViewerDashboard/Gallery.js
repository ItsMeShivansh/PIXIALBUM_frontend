import React, { useEffect, useState, useRef } from "react";
import "./Gallery.css";
import { fetchEventById, fetchEventImages, fetchLikedImages } from "../../utils/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ImageViewer from "./ImageViewer";
import MobileImageViewer from "./MobileImageViewer";

const LOCAL_KEY = "likedImagesByEvent";

function splitIntoColumns(images, numCols = 3) {
  const cols = Array.from({ length: numCols }, () => []);
  images.forEach((img, idx) => {
    cols[idx % numCols].push(img);
  });
  return cols;
}

function Gallery({ events = [], setEvents, goBack }) {
  const eventId = useParams().eventId;
  const [numCols, setNumCols] = useState(3);
  const [event, setEvent] = useState(null);
  const [fullScreenImg, setFullScreenImg] = useState(false);
  const [fullScreenIdx, setFullScreenIdx] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [columns, setColumns] = useState(Array.from({ length: numCols }, () => []));
  const [likedPhotos, setLikedPhotos] = useState([]);
  const [eventName, setEventName] = useState(event ? event.eventName : "");
  const [likedImageIds, setLikedImageIds] = useState(new Set());
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bottomReached, setBottomReached] = useState(true);
  const didMount = useRef(false);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const isMobile = window.innerWidth <= 700;
  const maxImagesInDOM = isMobile ? 30 : 30; // Adjust based on device type
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(-1);
  const fetchNextPageLock = useRef(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [triggerLoadMoreImagesCount, setTriggerLoadMoreImagesCount] = useState(0);

  // header visibility based on scroll
  useEffect(() => {
    let scrollTimeout = null;
    async function handleScroll() {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down: show header
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up: hide header
        setHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
      const galleryContainer = document.querySelector(".gallery-container");
      const targetScrollHeight = galleryContainer ? Math.max(galleryContainer.scrollHeight / 2, galleryContainer.scrollHeight - 2000) : Math.max(window.innerHeight / 2, window.innerHeight - 2000);
      if (currentScrollY >= targetScrollHeight && currentScrollY < targetScrollHeight + 500) {
        setTriggerLoadMoreImagesCount(prev => prev + 1);
      }
      console.log("headerVisible:", headerVisible);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Load liked images for this event from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const eventLiked = parsed[eventId] || [];
      setLikedImageIds(new Set(eventLiked));
    }

    // Update numCols dynamically on window resize
    function updateNumCols() {
      const width = window.innerWidth;
      if (width <= 700) {
        setNumCols(1); // Mobile
      } else if (width <= 1024) {
        setNumCols(2); // iPad/tablet
      } else {
        setNumCols(3); // Laptop/desktop
      }
    }

    updateNumCols();
    window.addEventListener("resize", updateNumCols);
    return () => window.removeEventListener("resize", updateNumCols);
  }, []);

  // Save liked images to localStorage whenever it changes
  const didFirstLoad = useRef(false);
  useEffect(() => {
    if (!eventId) return;
    if (!didFirstLoad.current) {
      didFirstLoad.current = true;
      return;
    }
    const stored = localStorage.getItem(LOCAL_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[eventId] = Array.from(likedImageIds);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
  }, [likedImageIds, eventId]);

  // Like/unlike handler
  const handleLike = (imgId) => {
    setLikedImageIds(prevLikedImages => {
      const newLikedImages = new Set(prevLikedImages);
      if (newLikedImages.has(imgId)) {
        newLikedImages.delete(imgId);
      } else {
        newLikedImages.add(imgId);
      }
      console.log("Updated liked images:", newLikedImages);
      return newLikedImages;
    });
  };

  // Fetch event details on mount
  useEffect(() => {
    async function loadEvent() {
      try {
        const eventLocal = events.find(e => e.eventId === eventId);
        if (eventLocal) {
          setEvent(eventLocal);
          setEventName(eventLocal.eventName || "Event Gallery");
          setPage(1);
        } else {
          // Fetch event details if not found in local state
          const eventData = await fetchEventById(eventId);
          if (eventData) {
            setEvent(eventData);
            setEventName(eventData.eventName);
          } else {
            console.error("Event not found");
            setErrorDetails("Event not found");
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    }
    loadEvent();
  }, [eventId]);

  async function loadImages() {
    if (!event || !hasMorePages || loading) return;
    if (fetchNextPageLock.current) return; // Prevent concurrent fetches
    fetchNextPageLock.current = true;
    setLoading(true);
    try {
      const data = await fetchEventImages(eventId, page, limit);
      if (data && data.images && data.images.length > 0) {
        if (data.images.length >= 3) {
          await Promise.all(
            data.images.slice(0, 3).map(img =>
              new Promise((resolve, reject) => {
                const image = new window.Image();
                image.src = img.rederUrl;
                image.onload = resolve;
                image.onerror = reject;
              })
            )
          );
        }
        setPhotos((prevPhotos) => {
          const newPhotos = [...prevPhotos, ...data.images];
          setColumns(splitIntoColumns(newPhotos, numCols));
          let windowOverflow = (endIndex - startIndex + 1) + data.images.length - maxImagesInDOM
          if (windowOverflow > 0) {
            setStartIndex((startIndex) => startIndex + windowOverflow)
          }
          setEndIndex((endIndex) => endIndex + data.images.length)
          return newPhotos;
        });
        // setColumns(splitIntoColumns([...photos, ...data.images], numCols));
        setHasMorePages(data.hasMorePages);
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setErrorDetails(error.message || "Failed to fetch images");
      // TODO: add retry logic
    } finally {
      fetchNextPageLock.current = false;
    }
    setLoading(false);
  }

  useEffect(() => {
    loadImages();
  }, [event, triggerLoadMoreImagesCount]);

  const onBack = () => {
    if (goBack) {
      goBack();
    } else {
      navigate(-1);
    }
  };

  // -----------------------------------------------------------------------------------------
  // Handle likedImages toggle and split images into columns
  useEffect(() => {
    if (showLikedOnly) {
      const likedIds = likedImageIds;
      if (likedIds.length === 0) {
        setLikedPhotos([]);
        return;
      }
      setLoading(true);
      fetchLikedImages(eventId, likedIds).then((data) => {
        if (data && data.images && data.images.length > 0) {
          // Promise.all(
          //   data.images.map(img =>
          //     new Promise((resolve, reject) => {
          //       const image = new window.Image();
          //       image.src = img.rederUrl;
          //       image.onload = resolve;
          //       image.onerror = reject;
          //     })
          //   )
          // )
          setLikedPhotos((prevLikedPhotos) => {
          const newPhotos = [...prevLikedPhotos, ...data.images];
          setColumns(splitIntoColumns(newPhotos, numCols));
          return newPhotos;
          });
        } else {
          console.error("No liked images found for this event.");
          setLikedPhotos([]);
        }
        setLoading(false);
      }).catch((error) => {
        console.error("Error fetching liked images:", error);
        setErrorDetails(error.message || "Failed to fetch liked images");
        setLikedPhotos([]);
        setLoading(false);
      });
    }
    else {
      setColumns(splitIntoColumns(photos, numCols));
    }
  }, [showLikedOnly, likedImageIds, eventId]);

  //----------------------------------------------------------------------------------------

  return (
    <div className="container" style={{ background: "black"}}>
      <div className={`gallery-header${headerVisible ? "" : " hide"}`}>
        {!isMobile && (
          <button className="gallery-back-btn" onClick={onBack}>
            &larr; Back to Events
          </button>
        )}
        <h2 className="gallery-title">{eventName} Gallery</h2>
        <div className="gallery-actions">
          <button
            className={`gallery-like-toggle-btn${showLikedOnly ? " liked" : ""}`}
            title={showLikedOnly ? "Show All Photos" : "Show Liked Photos"}
            onClick={() => setShowLikedOnly(liked => !liked)}
          >
            <i className={showLikedOnly ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
          </button>
        </div>
      </div>
      <div className="gallery-container">
        <div className="gallery-columns" id="gallery-columns">
          {columns.map((colImages, colIdx) => (
            <div className={`gallery-col gallery-col-${colIdx + 1}`} key={colIdx}>
              {colImages.map((img, idx) => {
                return (
                  <div 
                    className="gallery-img-wrapper"
                    key={img.imageId}
                    onContextMenu={e => e.preventDefault()}
                    onPointerDown={e => {
                      if (e.pointerType === "touch") {
                        e.preventDefault();
                      }
                    }}
                  >
                    <img
                      src={img.rederUrl}
                      alt={`Event ${eventName} ${colIdx * columns[0].length + idx + 1}`}
                      className="gallery-img"
                      onClick={() => {
                        setFullScreenImg(true);
                        setFullScreenIdx(idx * columns.length + colIdx);
                      }}
                      onContextMenu={e => e.preventDefault()}
                      draggable={false}
                      loading="lazy"
                    />
                    <button
                      className="gallery-img-download-btn"
                      title="Download"
                      onClick={e => {
                        e.stopPropagation();
                        const link = document.createElement("a");
                        link.href = img.dowloadUrl;
                        link.download = `image.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button
                      className={`gallery-img-like-btn${likedImageIds.has(img.imageId) ? " liked" : ""}`}
                      title={likedImageIds.has(img.imageId) ? "Unlike" : "Like"}
                      onClick={e => {
                        e.stopPropagation();
                        handleLike(img.imageId);
                      }}
                    >
                      <i className={likedImageIds.has(img.imageId) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {loading && <div className="loading">
            <span className="loading-spinner">
              <span className="spinner-dot"></span>
              <span className="spinner-dot"></span>
              <span className="spinner-dot"></span>
              <span className="spinner-dot"></span>
            </span>
          </div>
        }
        {hasMorePages && !loading && !showLikedOnly &&(
            <button
              className="load-more-btn"
              onClick={() => {
                loadImages();
              }}
            >
              Load More
            </button>
        )}
        {errorDetails && <div className="error-message">Error: {errorDetails}</div>}
        {columns[0].length === 0 && !loading ? (
          <div className="gallery-empty">
            {showLikedOnly
              ? "You haven't liked any photos yet. Click the heart icon on a photo to add it here!"
              : "No images found for this event."}
          </div>
        ) : null}
        {fullScreenImg && (
          isMobile ? (
            <MobileImageViewer
              images={showLikedOnly? likedPhotos : photos}
              initialIndex={fullScreenIdx}
              onClose={() => setFullScreenImg(false)}
              likedImages={likedImageIds}
              likedImagesOnly={showLikedOnly}
              setLikedImages={setLikedImageIds}
              fetchNextPage={loadImages}
              hasMorePages={hasMorePages}
              page={page}
            />
          ) : (
            <ImageViewer
              images={showLikedOnly ? likedPhotos : photos}
              initialIndex={fullScreenIdx}
              onClose={() => setFullScreenImg(false)}
              likedImages={likedImageIds}
              likedImagesOnly={showLikedOnly}
              setLikedImages={setLikedImageIds}
              fetchNextPage={loadImages}
              hasMorePages={showLikedOnly ? false : hasMorePages}
            />
          )
        )}
      </div>
    </div>
  );
}

export default Gallery;
