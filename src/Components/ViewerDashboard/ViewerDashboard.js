import React, { useEffect, useState } from "react";
import { fetchEventsSummary } from "../../utils/api";
import "./ViewerDashboard.css";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function ViewerDashboard({ username='Shivansh', events=[], setEvents=[], onLogout }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backPressCount, setBackPressCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // Step 1: Fetch Events Summary auth for viewer
  useEffect(() => {
    async function loadEventsSummary() {
      setLoading(true);
      fetchEventsSummary({ page: 1, limit: 5}).then((summary) => {
          if (!summary || !summary.events || summary.events.length === 0) {
            throw new Error("No events found");
          }
          setEvents(summary.events || []);
          setLoading(false);
        }).catch((error) => {
          console.error("Error fetching events summary:", error);
          setEvents([]);
          setLoading(false);
        });
    }
    loadEventsSummary();
    // eslint-disable-next-line
  }, []);

  // Step 4: Show gallery if an event is selected
  useEffect(() => {
    if (selectedEvent && selectedEvent.eventId) {
      navigate(`/viewer/${selectedEvent.eventId}`);
    }
  }, [selectedEvent, navigate]);

  // Handle back button press for exit confirmation
  useEffect(() => {
    function handlePopState(e) {
      if (backPressCount === 0) {
        setShowToast(true);
        setBackPressCount(1);
        setTimeout(() => {
          setShowToast(false);
          setBackPressCount(0);
        }, 2000);
        window.history.pushState(null, '', window.location.pathname); // Prevent actual back
      } else if (backPressCount === 1) {
        window.removeEventListener('popstate', handlePopState);
        window.close(); // Try to close the tab (may not work in all browsers)
        window.location.href = 'about:blank'; // Fallback: navigate away
      }
    }
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line
  }, [backPressCount]);

  if (loading) {
    return <div className="loading">
      <span className="loading-spinner">
        <span className="spinner-dot"></span>
        <span className="spinner-dot"></span>
        <span className="spinner-dot"></span>
        <span className="spinner-dot"></span>
      </span>
    </div>;
  }

  // Step 5: Show event list
  return (
    <div className="container">
      <div className="viewer-dashboard">
        {/* Logout Button */}
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <h2>{username}'s Events</h2>
        <div className="viewer-event-list">
          {events.length === 0 ? (
            <div>No events found.</div>
          ) : (
            events.map(event => (
              <div
                key={event.eventId}
                className="viewer-event-card"
                onClick={() => setSelectedEvent(event)}
              >
                <h3>{event.eventName}</h3>
                <div className="event-card-meta">
                  <span className="event-meta-badge date">
                    <i className="fa-regular fa-calendar-days"></i>
                    {formatDate(event?.eventDate)}
                  </span>
                  <span className="event-meta-badge type">
                    <i className="fa-solid fa-tag"></i>
                    {event?.eventType}
                  </span>
                  <span className="event-meta-badge venue">
                    <i className="fa-solid fa-location-dot"></i>
                    {event?.venueName}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {showToast && (
          <div className="toast-exit">
            Press again to exit
          </div>
        )}
        {/* Beta version notice */}
        <div style={{
          width: "100%",
          textAlign: "center",
          color: "#fff",
          fontSize: "1rem",
          opacity: 0.7,
          marginTop: "2rem",
          marginBottom: "0.5rem",
          letterSpacing: "1px"
        }}>
          This is a beta version of the website
        </div>
      </div>
    </div>
  );
}

export default ViewerDashboard;