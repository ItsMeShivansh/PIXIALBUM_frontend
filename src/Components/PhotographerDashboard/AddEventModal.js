import React, { useState, useEffect } from 'react';
import { createEvent, fetchEventTypes } from '../../utils/api';
import './AddEventModal.css';

function AddEventModal({ onClose, onAdd }) {
  const [eventName, setEventName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Fetch event types from backend on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        let types = await fetchEventTypes();
        console.log('Fetched event types:', types);
        if (!Array.isArray(types)) types = [];
        setEventTypes(types);
        if (types.length > 0) setEventType(types[0]);
        setFetchError(false);
      } catch (err) {
        setEventTypes([]);
        setFetchError(true);
      }
    };
    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Passing venueId as 1 for now
      const response = await createEvent({
        eventName,
        venueName: venue,
        eventDate: date,
        eventType
      });

      if (response && (response.success || response.eventId)) {
        onAdd({
          id: response.eventId || Date.now(),
          name: eventName,
          venue,
          date,
          eventType
        });
        onClose();
      } else {
        alert(response.message || 'Failed to add event.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add New Event</h3>
        {fetchError && (
          <div className="error-dialog" style={{ color: 'var(--color-error, #ff5252)', marginBottom: '1rem', textAlign: 'center' }}>
            Failed to fetch event types. Please try again later.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Venue</label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Event Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              required
              disabled={eventTypes.length === 0}
            >
              {eventTypes.length === 0 ? (
                <option value="">Loading...</option>
              ) : (
                eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))
              )}
            </select>
          </div>
          <div className="btn-wrapper" style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={loading || fetchError}>
              {loading ? 'Adding...' : 'Add Event'}
            </button>
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;