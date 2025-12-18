// import React, { useRef, useState, useEffect, useCallback } from "react";
// import { Masonry, CellMeasurer, CellMeasurerCache, AutoSizer } from "react-virtualized";
// import { createCellPositioner } from "react-virtualized/dist/es/Masonry";

// // Responsive column count
// function useColumnCount() {
//   const [columns, setColumns] = useState(1);
//   useEffect(() => {
//     function handleResize() {
//       if (window.innerWidth < 900) setColumns(1);
//       else if (window.innerWidth < 1200) setColumns(2);
//       else setColumns(3);
//     }
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);
//   return columns;
// }

// function GalleryGrid({ photos, goBack, eventName }) {
//   const columns = useColumnCount();
//   const masonryRef = useRef(null);
//   const [columnWidth, setColumnWidth] = useState(200);

//   const cache = useRef(
//     new CellMeasurerCache({
//       defaultHeight: 250,
//       defaultWidth: 200, // Start with a small value, will be overridden
//       fixedWidth: true,
//     })
// );

//   // Calculate column width based on container width and column count
//   const cellRenderer = ({ index, key, parent, style }) => {
//     const photo = photos[index];
//     return (
//       <CellMeasurer
//         cache={cache.current}
//         index={index}
//         key={key}
//         parent={parent}
//         columnIndex={0}
//       >
//         <div style={{ ...style, margin: 8, width: columnWidth }}>
//           <img
//             src={photo.rederUrl}
//             alt={`Photo ${index}`}
//             style={{
//               width: "100%",
//               aspectRatio: `${photo.width} / ${photo.height}`,
//               objectFit: "cover",
//               borderRadius: 8,
//               display: "block",
//             }}
//           />
//         </div>
//       </CellMeasurer>
//     );
//   };

//   // Positioner for react-virtualized Masonry
//   const SPACING = 8;

//   const cellPositionerConfig = useRef({
//     cellMeasurerCache: cache.current,
//     columnCount: columns,
//     columnWidth: columnWidth,
//     spacer: SPACING,
//   });

//   const onResize = useCallback(
//     ({ width }) => {
//       const newColumnWidth = Math.floor((width - SPACING * columns) / columns);
//       setColumnWidth(newColumnWidth);
//       cellPositionerConfig.current = {
//         ...cellPositionerConfig.current,
//         columnCount: columns,
//         columnWidth: newColumnWidth,
//       };
//       cache.current.clearAll();
//       if (masonryRef.current) {
//         masonryRef.current.clearCellPositions();
//       }
//     },
//     [columns]
//   );

//   useEffect(() => {
//     cache.current.clearAll();
//     if (masonryRef.current) {
//       masonryRef.current.clearCellPositions();
//     }
//   }, [photos]);

//   return (
//     <div
//       style={{
//         width: "100vw",
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column", // Add column direction for header + gallery
//         justifyContent: "flex-start",
//         alignItems: "center",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           width: "100%",
//           padding: "24px 0 12px 0",
//           textAlign: "center",
//           fontSize: "2rem",
//           fontWeight: "bold",
//           letterSpacing: "1px",
//           color: "#fff",
//           background: "rgba(0,0,0,0.2)",
//           backdropFilter: "blur(2px)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           position: "relative",
//         }}
//       >
//         {/* Back Button */}
//         <button
//           onClick={goBack}
//           style={{
//             position: "absolute",
//             left: 24,
//             top: "50%",
//             transform: "translateY(-50%)",
//             background: "rgba(0,0,0,0.4)",
//             color: "#fff",
//             border: "none",
//             borderRadius: "50%",
//             width: 36,
//             height: 36,
//             cursor: "pointer",
//             fontSize: "1.5rem",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//           aria-label="Back"
//         >
//           ←
//         </button>
//         {eventName} Gallery
//       </div>
//       {/* Gallery */}
//       <div style={{ width: "100vw", height: "100%", flex: 1 }}>
//         <AutoSizer onResize={onResize}>
//           {({ width, height }) => {
//             const colWidth = Math.floor((width - SPACING * (columns-1)) / columns);
//             cellPositionerConfig.current.columnCount = columns;
//             cellPositionerConfig.current.columnWidth = colWidth;
//             return (
//               <Masonry
//                 ref={masonryRef}
//                 cellCount={photos.length}
//                 cellMeasurerCache={cache.current}
//                 cellPositioner={
//                   createCellPositioner(cellPositionerConfig.current)
//                 }
//                 cellRenderer={cellRenderer}
//                 height={height}
//                 width={width}
//                 overscanByPixels={100}
//               />
//             );
//           }}
//         </AutoSizer>
//       </div>
//     </div>
//   );
// }

// export default GalleryGrid;