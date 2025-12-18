// import React, { useEffect, useState, useRef } from "react";
// import "./Gallery.css";
// import { fetchEventById, fetchEventImages, fetchLikedImages } from "../../utils/api";
// import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import ImageViewer from "./ImageViewer";
// import MobileImageViewer from "./MobileImageViewer";

// const LOCAL_KEY = "likedImagesByEvent";

// function splitIntoColumns(images, numCols = 3) {
//   const cols = Array.from({ length: numCols }, () => []);
//   images.forEach((img, idx) => {
//     cols[idx % numCols].push(img);
//   });
//   return cols;
// }

// function Gallery({ events = [], setEvents, goBack }) {
//   const eventId = useParams().eventId;
//   const [event, setEvent] = useState(null);
//   const [fullScreenImg, setFullScreenImg] = useState(false);
//   const [fullScreenIdx, setFullScreenIdx] = useState(null);
//   const [errorDetails, setErrorDetails] = useState(null);
//   const [imagesToRender, setImagesToRender] = useState([]);
  
//   const [eventName, setEventName] = useState(event ? event.eventName : "");
//   const [likedImages, setLikedImages] = useState(new Set());
//   const navigate = useNavigate();
//   const numCols = 3;
//   const [columns, setColumns] = useState(Array.from({ length: numCols }, () => []));
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(9);
//   const [hasMorePages, setHasMorePages] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [bottomReached, setBottomReached] = useState(true);
//   const didMount = useRef(false);
//   const [showLikedOnly, setShowLikedOnly] = useState(false);
//   const isMobile = window.innerWidth <= 700;
//   let fetchCallInProgress = false;

//   // Load liked images for this event from localStorage on mount
//   useEffect(() => {
//     const stored = localStorage.getItem(LOCAL_KEY);
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       const eventLiked = parsed[eventId] || [];
//       setLikedImages(new Set(eventLiked));
//     }
//   }, []);

//   // Save liked images to localStorage whenever it changes
//   const didFirstLoad = useRef(false);
//   useEffect(() => {
//     if (!eventId) return;
//     if (!didFirstLoad.current) {
//       didFirstLoad.current = true;
//       return;
//     }
//     const stored = localStorage.getItem(LOCAL_KEY);
//     const parsed = stored ? JSON.parse(stored) : {};
//     parsed[eventId] = Array.from(likedImages);
//     localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
//   }, [likedImages, eventId]);

//   // Like/unlike handler
//   const handleLike = (imgId) => {
//     setLikedImages(prevLikedImages => {
//       const newLikedImages = new Set(prevLikedImages);
//       if (newLikedImages.has(imgId)) {
//         newLikedImages.delete(imgId);
//       } else {
//         newLikedImages.add(imgId);
//       }
//       console.log("Updated liked images:", newLikedImages);
//       return newLikedImages;
//     });
//   };

//   // To Fetch Next page
//   async function fetchNextPage() {
//     if (loading || !hasMorePages) return;
//     setLoading(true);
//     fetchEventImages(eventId, page, limit).then((data) => {
//       if (data && data.images && data.images.length > 0) {
//         setImagesToRender((prevImages) => [...prevImages, ...data.images]);
//         setHasMorePages(data.hasMorePages);
//         setPage((prevPage) => prevPage + 1);
//       } else {
//         setHasMorePages(false);
//       }
//     }).catch((error) => {
//       console.error("Error fetching images:", error);
//       setErrorDetails(error.message || "Failed to fetch images");
//       setLoading(false);
//     });
//   };

//   // Handle scroll to detect if bottom is reached
//   function handleScroll() {
//     const galleryContainer = document.documentElement;
//     const scrollTop = galleryContainer.scrollTop;
//     const windowHeight = window.innerHeight;
//     const scrollHeight = galleryContainer.scrollHeight;
//     const scrolledPercent = (scrollTop + windowHeight) / scrollHeight;
//     if (scrolledPercent >= 0.99) {
//       setBottomReached(true);
//     } else {
//       setBottomReached(false);
//     }
//   };


//   // Fetch event details and images on mount
//   useEffect(() => {
//     if (eventId) {
//       const eventLocal = events.find(e => e.eventId === eventId);
//       if (eventLocal) {
//         setEvent(eventLocal);
//         setEventName(eventLocal.eventName || "Event Gallery");
//       } else {
//         fetchEventById(eventId).then((fetchedEvent) => {
//           if (fetchedEvent) {
//             setEvent(fetchedEvent);
//             setEventName(fetchedEvent.eventName || "Event Gallery");
//           }
//         }).catch((error) => {
//           console.error("Error fetching event:", error);
//           setErrorDetails(error.message || "Failed to fetch event details");
//         });
//       }
//     }
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   useEffect(() => {
//     if (!event || showLikedOnly || loading || !hasMorePages || !bottomReached) return;
//     setLoading(true);
//     setBottomReached(false);
//     fetchNextPage();
//   }, [event, bottomReached]);

//   const onBack = () => {
//     if (goBack) {
//       goBack();
//     } else {
//       navigate(-1);
//     }
//   };

//   // -----------------------------------------------------------------------------------------
//   // Handle likedImages toggle and split images into columns

//   useEffect(() => {
//     if (imagesToRender) {
//       const likedIds = likedImages || [];
//       if (showLikedOnly) {
//         setLoading(true);
//         setColumns(Array.from({ length: numCols }, () => []));
//         fetchLikedImages(eventId, likedIds).then((data) => {
//           if (data && data.images) {
//             const newColumns = splitIntoColumns(data.images, numCols);
//             console.info("Fetched liked images:", newColumns);
//             setColumns(newColumns);
//           } else {
//             console.error("No liked images found for this event.");
//             setColumns(Array.from({ length: numCols }, () => []));
//           }
//           setLoading(false);
//         }).catch((error) => {
//           console.error("Error fetching liked images:", error);
//           setErrorDetails(error.message || "Failed to fetch liked images");
//           setColumns(Array.from({ length: numCols }, () => []));
//           setLoading(false);
//         });
//       } else {
//         const newColumns = splitIntoColumns(imagesToRender, numCols);
//         setColumns(newColumns);
//         setTimeout(() => {
//           setLoading(false);
//           setBottomReached(false);
//         }, 500); // Set loading to false after 500ms
//       }
//     }
//     if (!didMount.current) {
//       window.addEventListener("scroll", handleScroll);
//       didMount.current = true;
//     }
//   }, [imagesToRender, numCols, showLikedOnly, likedImages, eventId]);

//   //----------------------------------------------------------------------------------------

//   return (
//     <div className="container" style={{ background: "black"}}>
//       <div className="gallery-container" id="gallery-container">
//         <div className="gallery-header">
//           <button className="gallery-back-btn" onClick={onBack}>
//             &larr; Back to Events
//           </button>
//           <h2 className="gallery-title">{eventName} Gallery</h2>
//           <div className="gallery-actions">
//             <button
//               className={`gallery-like-toggle-btn${showLikedOnly ? " liked" : ""}`}
//               title={showLikedOnly ? "Show All Photos" : "Show Liked Photos"}
//               onClick={() => setShowLikedOnly(liked => !liked)}
//             >
//               <i className={showLikedOnly ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
//             </button>
//           </div>
//         </div>
        
//         <div className="gallery-columns" id="gallery-columns">
//           {columns.map((colImages, colIdx) => (
//             <div className={`gallery-col gallery-col-${colIdx + 1}`} key={colIdx}>
//               {colImages.map((img, idx) => (
//                 <div 
//                   className="gallery-img-wrapper"
//                   key={img.imageId}
//                   onContextMenu={e => e.preventDefault()}
//                   onPointerDown={e => {
//                     if (e.pointerType === "touch") {
//                       e.preventDefault();
//                     }
//                   }}
//                 >
//                   <img
//                     src={img.rederUrl}
//                     alt={`Event ${eventName} ${colIdx * columns[0].length + idx + 1}`}
//                     className="gallery-img"
//                     onClick={() => {
//                       setFullScreenImg(true);
//                       setFullScreenIdx(idx * columns.length + colIdx);
//                     }}
//                     onContextMenu={e => e.preventDefault()}
//                     draggable={false}
//                   />
//                   <button
//                     className="gallery-img-download-btn"
//                     title="Download"
//                     onClick={e => {
//                       e.stopPropagation();
//                       const link = document.createElement("a");
//                       link.href = img.dowloadUrl;
//                       link.download = `image.jpg`;
//                       document.body.appendChild(link);
//                       link.click();
//                       document.body.removeChild(link);
//                     }}
//                   >
//                     <i className="fa-solid fa-download"></i>
//                   </button>
//                   <button
//                     className={`gallery-img-like-btn${likedImages.has(img.imageId) ? " liked" : ""}`}
//                     title={likedImages.has(img.imageId) ? "Unlike" : "Like"}
//                     onClick={e => {
//                       e.stopPropagation();
//                       handleLike(img.imageId);
//                     }}
//                   >
//                     <i className={likedImages.has(img.imageId) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
//                   </button>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//         {loading && <div className="loading">
//             <span className="loading-spinner">
//               <span className="spinner-dot"></span>
//               <span className="spinner-dot"></span>
//               <span className="spinner-dot"></span>
//               <span className="spinner-dot"></span>
//             </span>
//           </div>
//         }
//         {columns[0].length === 0 ? (
//           <div className="gallery-empty">
//             {showLikedOnly
//               ? "You haven't liked any photos yet. Click the heart icon on a photo to add it here!"
//               : "No images found for this event."}
//           </div>
//         ) : null}
//         {fullScreenImg && (
//           isMobile ? (
//             <MobileImageViewer
//               images={imagesToRender}
//               initialIndex={fullScreenIdx}
//               onClose={() => setFullScreenImg(false)}
//               likedImages={likedImages}
//               likedImagesOnly={showLikedOnly}
//               setLikedImages={setLikedImages}
//               fetchNextPage={fetchNextPage}
//               hasMorePages={hasMorePages}
//               page={page}
//               limit={limit}
//             />
//           ) : (
//             <ImageViewer
//               images={imagesToRender}
//               initialIndex={fullScreenIdx}
//               onClose={() => setFullScreenImg(false)}
//               likedImages={likedImages}
//               likedImagesOnly={showLikedOnly}
//               setLikedImages={setLikedImages}
//               fetchNextPage={fetchNextPage}
//               hasMorePages={hasMorePages}
//             />
//           )
//         )}
//       </div>
//     </div>
//   );
// }


// export default Gallery;
