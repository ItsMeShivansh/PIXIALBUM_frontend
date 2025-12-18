import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventList.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function EventList({ events, total, page, limit, setPage, setLimit }) {
  const navigate = useNavigate();
  if (!Array.isArray(events) || events.length === 0) {
    return <div className="no-events-msg">No events yet. Start by adding a new event!</div>;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="event-list-conatainer">
      <div className="event-list">
        {events.map(event => (
          <div
            key={event.id}
            className="event-list-item"
            onClick={() => navigate(`/dashboard/event/${event.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="event-card">
              <span className="event-name">
                {event.name}
              </span>
              <div className="event-details">
                <span className="event-date">
                  <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
                  {formatDate(event.date)}
                </span>
                <span className="event-venue">
                  <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                  {event.venue}
                </span>
                <span className="event-type">
                  <i className="fa-solid fa-tag" aria-hidden="true"></i>
                  {event.eventType}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="event-pagination-wrapper">
        <div className="event-pagination">
          <button
            className="event-pagination-btn"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="event-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="event-pagination-btn"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
        <div className="event-limit-dropdown-wrapper" >
          <div className="event-limit-dropdown-label" >
            Events per page:
          </div>
          <select
            className="event-limit-dropdown"
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={15}>15 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default EventList;

