import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { Masonry, CellMeasurer, CellMeasurerCache, AutoSizer } from "react-virtualized";
import { fetchEventById, fetchEventImages } from '../../utils/api';
import { createCellPositioner } from "react-virtualized/dist/es/Masonry";
import debounce from 'lodash.debounce';

const NewGallery = ({ events = [], setEvents, goBack }) => {
  const { eventId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(0);
  const [limit] = useState(9);
  const [event, setEvent] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);
  const masonryRef = useRef(null);
  const pageEndRef = useRef(null);
  // Use index as unique key for each cell (since Masonry is 1D, index is sufficient)
  const [cache, setCache] = useState(new CellMeasurerCache({
    defaultHeight: 200,
    defaultWidth: 300,
    fixedWidth: true,
    keyMapper: index => `${index}`,
  }));
  const spacing = 1;
  const cellPositionerRef = useRef(createCellPositioner({
    cellMeasurerCache: cache,
    columnCount: 3, // Default to 3 columns
    columnWidth: cache.defaultWidth + spacing, // Add spacing
    spacer: spacing,
  }));

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
            setPage(1);
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

  useEffect(() => {
    async function loadImages() {
      if (!event || !hasMorePages) return;
      setLoading(true);
      try {
        const data = await fetchEventImages(eventId, page, limit);
        if (data && data.images && data.images.length > 0) {
          await Promise.all(
            data.images.map(img =>
              new Promise((resolve, reject) => {
                const image = new window.Image();
                image.src = img.rederUrl;
                image.onload = resolve;
                image.onerror = reject;
              })
            )
          );
          if (cache) cache.clearAll();
          if (masonryRef.current) masonryRef.current.clearCellPositions();
          setPhotos((prevPhotos) => [...prevPhotos, ...data.images]);
          setHasMorePages(data.hasMorePages);
        } else {
          setHasMorePages(false);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setErrorDetails(error.message || "Failed to fetch images");
        // TODO: add retry logic
      }
      setLoading(false);
    }
    loadImages();
  }, [page]);

  const setNextPageDebounced = debounce((observerEntry) => {
    if (observerEntry && observerEntry.isIntersecting && hasMorePages && !loading) {
      setPage(prev => prev + 1);
    }
  }, 300);
  // Infinite scroll observer with debounce
  // useEffect(() => {
  //   if (!hasMorePages) return;
  //   const observer = new IntersectionObserver(
  //     entries => {
  //       if (entries[0].isIntersecting && hasMorePages && !loading) {
  //         setTimeout(() => {
  //           if (entries[0].isIntersecting && hasMorePages && !loading) {
  //             setPage(prev => prev + 1);
  //           }
  //         }, 1000); // Debounce to avoid too many rapid calls
  //       }
  //     },
  //     { threshold: 1 }
  //   );
  //   console.log("Setting up observer for page end ref:", pageEndRef.current);
  //   if (pageEndRef.current) observer.observe(pageEndRef.current);
  //   return () => {
  //     if (pageEndRef.current) observer.unobserve(pageEndRef.current);
  //   };
  // }, [pageEndRef.current]);

  // Render each image cell
  const cellRenderer = ({ index, key, parent, style }) => (
    <CellMeasurer
      cache={cache}
      index={index}
      key={key}
      parent={parent}
      style={style}
    >
      <div style={{ ...style, padding: 8, boxSizing: "border-box" }}>
        <img
          src={photos[index].rederUrl}
          alt={photos[index].imageId}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 8,
            // display: "block",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          // loading="lazy"
        />
      </div>
    </CellMeasurer>
  );

  return (
    <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
      }}>
      <h2>Virtualized Masonry Gallery</h2>
      <div style={{ width: "100vw", height: "100%", flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => {
            const columns = Math.max(1, Math.floor(width / (cache.defaultWidth + spacing)));
            cellPositionerRef.current = createCellPositioner({
              cellMeasurerCache: cache,
              columnCount: columns,
              columnWidth: cache.defaultWidth + spacing,
              spacer: spacing,
            });
            return (
              <Masonry
                ref={masonryRef}
                cellCount={photos.length}
                cellMeasurerCache={cache}
                cellPositioner={cellPositionerRef.current}
                cellRenderer={cellRenderer}
                height={height}
                width={width}
                overscanByPixels={200}
              />
            );
          }}
        </AutoSizer>
      </div>
      {loading && <div>Loading...</div>}
      {errorDetails && <div style={{ color: "red" }}>Error: {errorDetails}</div>}
      <button
        onClick={() => {
          if (hasMorePages && !loading) {
            setPage(prev => prev + 1);
          }
        }}
        disabled={!hasMorePages || loading}
        style={{ margin: 16, padding: "8px 24px", fontSize: 16 }}
      >
        {loading ? "Loading..." : hasMorePages ? "Load More" : "No More Images"}
      </button>
    </div>
  );
};

export default NewGallery;