import React, { useState, useEffect, useRef } from 'react';
import './PhotographerDashboard.css';
import AddEventModal from './AddEventModal.js';
import { fetchUserDetails, fetchEventsSummary } from '../../utils/api.js';
import MoreMenu from './MoreMenu.js';
import logo from '../../assets/logo.png';
import EventList from './EventList.js';
import Profile from './Profile.js';
import ContactUs from './ContactUs.js';
import { useNavigate } from 'react-router-dom';

function PhotographerDashboard({ username, onLogout, events, setEvents }) {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [Logout, setLogout] = useState(false);
  const moreMenuBtnRef = useRef(null);
  const moreMenuRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user details once
  useEffect(() => {
    setLoading(true);
    fetchUserDetails(username)
      .then(setUserDetails)
      .catch(() => setUserDetails(null))
      .finally(() => setLoading(false));
  }, [username]);

  // Fetch events when page or limit changes
  useEffect(() => {
    setLoading(true);
    fetchEventsSummary({ page, limit })
      .then(data => {
        setEvents((data.events || []).map(ev => ({
          id: ev.eventId,
          name: ev.eventName,
          date: ev.eventDate,
          eventType: ev.eventType,
          venue: ev.venueName,
        })));
        setTotal(data.total || 0);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, limit, setEvents]);

  // Close MoreMenu when clicking outside
  useEffect(() => {
    if (!showMoreMenu) return;
    function handleClickOutside(e) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target) &&
        moreMenuBtnRef.current &&
        !moreMenuBtnRef.current.contains(e.target)
      ) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const handleAddEvent = (eventData) => {
    setEvents(prevEvents => [
      ...prevEvents,
      {
        id: eventData.id || prevEvents.length + 1,
        name: eventData.name,
        date: eventData.date,
        venue: eventData.venue,
        eventType: eventData.eventType
      }
    ]);
    setShowAddEvent(false);
  };

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    (event.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.eventType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="photographer-dashboard">Loading...</div>;
  }

  if (!userDetails) {
    return <div className="photographer-dashboard">Failed to load user details.</div>;
  }

  // Show profile page if requested
  if (showProfile) {
    return (
      <Profile
        user={userDetails}
        goBack={() => setShowProfile(false)}
      />
    );
  }

  if (showContact) {
    return (
      <ContactUs
        goBack={() => setShowContact(false)}
      />
    );
  }

  if (Logout) {
    onLogout();
    navigate('/');
    return null; // Prevent further rendering
  }

  return (
    <div className="container">
      <div className="more-menu-wrapper">
        <button
          className="more-menu-toggle"
          ref={moreMenuBtnRef}
          onClick={() => setShowMoreMenu((v) => !v)}
          aria-label="More options"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <i
            className="fa-solid fa-bars"
            style={{ fontSize: '1.7rem', color: '#fff' }}
          ></i>
        </button>
        
        {showMoreMenu && (
          <div ref={moreMenuRef}>
            <MoreMenu
              onProfile={() => setShowProfile(true)}
              onContact={() => setShowContact(true)}
              onThemeToggle={() => {/* handle theme toggle */}}
              onFeedback={() => {/* handle feedback */}}
              onLogout={() => setLogout(true)}
            />
          </div>
        )}
      </div>
      <div className="dashboard-header">
        <img
          src={logo}
          alt="Logo"
          style={{ maxWidth: '180px', width: '100%', height: 'auto', display: 'inline-block' }}
        />
        <h2>Welcome,<br />{userDetails.companyName}!</h2>
      </div>
      <div className="photographer-dashboard">
        <section className="events-section">
          <h3>Previous Events</h3>
          <div className="list-header">
            <input
              type="text"
              className="event-search-bar"
              placeholder="Search events by name or type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="btn" onClick={() => setShowAddEvent(true)}>
              + Add New Event
            </button>
          </div>
          <EventList
            events={filteredEvents}
            total={total}
            page={page}
            limit={limit}
            setPage={setPage}
            setLimit={setLimit}
          />
        </section>
        {showAddEvent && (
          <AddEventModal onAdd={handleAddEvent} onClose={() => setShowAddEvent(false)} />
        )}
      </div>
    </div>
  );
}

export default PhotographerDashboard;
