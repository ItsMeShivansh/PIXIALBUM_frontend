import React, { useEffect, useState } from 'react';
import { getEventsById } from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import './EventCard.css';
import { uploadEventImage, fetchEventImages, createEventViewer, fetchEventViewers } from '../../utils/api'; // <-- Import the new API

function EventCard({ events }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [showAddViewer, setShowAddViewer] = useState(false);
  const [viewerForm, setViewerForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [viewerError, setViewerError] = useState('');
  const [viewerSuccess, setViewerSuccess] = useState('');
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editEventForm, setEditEventForm] = useState({
    name: '',
    date: '',
    eventType: '',
    venue: '',
  });
  const [editEventError, setEditEventError] = useState('');
  const [editEventSuccess, setEditEventSuccess] = useState('');
  const [showAddPhotos, setShowAddPhotos] = useState(false);
  const [gallery, setGallery] = useState([]); // Array of photo URLs or objects
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [viewers, setViewers] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const fetchEventById = async (id) => {
    const eventData = events.find(event => event.id === id);
    if (!eventData) {
      throw new Error('Event not found');
    }
    return eventData;
  }

  const handlePhotoChange = (e) => {
    setPhotoFiles(Array.from(e.target.files));
    setPhotoError('');
    setPhotoSuccess('');
  };

  // Fetch images for the event
  const loadGallery = async () => {
    try {
      const obj = await fetchEventImages(eventId);
      setGallery(obj.images || []);
    } catch (err) {
      setGallery([]);
    }
  };

  // Load viewers for the event
  const loadViewers = async () => {
    try {
      const data = await fetchEventViewers(eventId);
      setViewers(data || []);
    } catch (err) {
      setViewers([]);
    }
  };

  // Update handleAddPhotos to reload gallery after upload
  const handleAddPhotos = async (e) => {
    e.preventDefault();
    setPhotoError('');
    setPhotoSuccess('');
    setPhotoUploading(true);

    if (!photoFiles.length) {
      setPhotoError('Please select at least one photo.');
      setPhotoUploading(false);
      return;
    }

    try {
      for (const file of photoFiles) {
        await uploadEventImage(file, eventId);
      }
      setPhotoSuccess('Photos uploaded!');
      setPhotoFiles([]);
      await loadGallery(); // Refresh gallery after upload
      setTimeout(() => {
        setShowAddPhotos(false);
        setPhotoSuccess('');
      }, 1200);
    } catch (err) {
      setPhotoError('Failed to upload one or more photos.');
    }
    setPhotoUploading(false);
  };

  useEffect(() => {
    async function getEventAndImages() {
      try {
        let data;
        if (!events || events.length === 0) {
          data = await getEventsById(eventId);
          data = {
            id: data.eventId,
            name: data.eventName,
            date: data.eventDate,
            eventType: data.eventType,
            venue: data.venueName,
          };
        } else {
          data = await fetchEventById(eventId);
        }
        setEvent(data);
        await loadGallery();
        await loadViewers(); // <-- fetch viewers here
      } catch (err) {
        setEvent(null);
      }
    }
    getEventAndImages();
    // eslint-disable-next-line
  }, [eventId, events]);

  // Handle Add Viewer form changes
  const handleViewerChange = (e) => {
    setViewerForm({ ...viewerForm, [e.target.name]: e.target.value });
  };

  // Handle Add Viewer form submit
  const handleAddViewer = async (e) => {
    e.preventDefault();
    setViewerError('');
    setViewerSuccess('');

    // Simple validation
    if (!viewerForm.name || !viewerForm.email || !viewerForm.password || !viewerForm.confirmPassword) {
      setViewerError('All fields are required.');
      return;
    }
    if (viewerForm.password !== viewerForm.confirmPassword) {
      setViewerError('Passwords do not match.');
      return;
    }

    try {
      await createEventViewer({
        name: viewerForm.name,
        email: viewerForm.email,
        password: viewerForm.password,
        eventId
      });
      setViewerSuccess('Viewer added successfully!');
      setViewerForm({ name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        setShowAddViewer(false);
        setViewerSuccess('');
      }, 1200);
      await loadViewers(); // Refresh viewers list after adding
    } catch (err) {
      setViewerError('Failed to add viewer. Please try again.');
    }
  };

  // Open Edit Modal and prefill with current event info
  const handleEditEventOpen = () => {
    setEditEventForm({
      name: event.name || '',
      date: event.date ? event.date.slice(0, 10) : '', // yyyy-mm-dd for input type="date"
      eventType: event.eventType || '',
      venue: event.venue || '',
    });
    setShowEditEvent(true);
    setEditEventError('');
    setEditEventSuccess('');
  };

  // Handle Edit Event form changes
  const handleEditEventChange = (e) => {
    setEditEventForm({ ...editEventForm, [e.target.name]: e.target.value });
  };

  // Handle Edit Event form submit
  const handleEditEvent = (e) => {
    e.preventDefault();
    setEditEventError('');
    setEditEventSuccess('');

    // Simple validation
    if (!editEventForm.name || !editEventForm.date || !editEventForm.eventType) {
      setEditEventError('Name, Date, and Type are required.');
      return;
    }

    // TODO: Update event in backend or state here
    // Example: await updateEvent({ ...editEventForm, id: event.id });

    setEditEventSuccess('Event updated!');
    setTimeout(() => {
      setShowEditEvent(false);
      setEditEventSuccess('');
      // Optionally, update local event state:
      setEvent(prev => ({
        ...prev,
        ...editEventForm,
      }));
    }, 1200);
  };

  // Utility function to format date as dd-mm-yyyy
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (!event) return <div className="event-card-page">Loading event...</div>;

  return (
    <div className="container">
      <div className="event-card-page">
        <button className="event-back-btn" onClick={() => navigate('/dashboard')}>
          <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>
        <div className="event-card-header">
          <h2>{event?.name}</h2>
          <div className="event-card-meta">
            <span className="event-meta-badge date">
              <i className="fa-solid fa-calendar-days"></i>
              {formatDate(event?.date)}
            </span>
            <span className="event-meta-badge type">
              <i className="fa-solid fa-tag"></i>
              {event?.eventType}
            </span>
            <span className="event-meta-badge venue">
              <i className="fa-solid fa-location-dot"></i>
              {event?.venue}
            </span>
          </div>
        </div>
        <div className="event-viewer-list-topright">
          <span className="event-viewer-list-label">
            <i className="fa-solid fa-users"></i> Viewers
          </span>
          {viewers.length === 0 ? (
            <div className="event-viewer-empty">No viewers yet</div>
          ) : (
            <ul className="event-viewer-ul">
              {viewers.map((viewer, idx) => (
                <li key={idx} className="event-viewer-li">
                  <span className="event-viewer-name">{viewer.name || viewer.userId}</span>
                  <span className="event-viewer-email">{viewer.email || viewer.emailId}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="event-card-actions">
          <button onClick={() => setShowAddViewer(true)}>Add Viewer</button>
          <button onClick={handleEditEventOpen}>Edit Event Info</button>
          <button onClick={() => setShowAddPhotos(true)}>Add Photos</button>
        </div>
        {/* Add Viewer Modal */}
        {showAddViewer && (
          <div className="event-modal-backdrop">
            <div className="event-modal">
              <button className="event-modal-close" onClick={() => setShowAddViewer(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h3>Add Viewer</h3>
              <form className="event-modal-form" onSubmit={handleAddViewer}>
                <input
                  type="text"
                  name="name"
                  placeholder="Viewer Name"
                  value={viewerForm.name}
                  onChange={handleViewerChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Viewer Email"
                  value={viewerForm.email}
                  onChange={handleViewerChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={viewerForm.password}
                  onChange={handleViewerChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={viewerForm.confirmPassword}
                  onChange={handleViewerChange}
                  required
                />
                {viewerError && <div className="event-modal-error">{viewerError}</div>}
                {viewerSuccess && <div className="event-modal-success">{viewerSuccess}</div>}
                <button type="submit">Add Viewer</button>
              </form>
            </div>
          </div>
        )}
        {/* Edit Event Modal */}
        {showEditEvent && (
          <div className="event-modal-backdrop">
            <div className="event-modal">
              <button className="event-modal-close" onClick={() => setShowEditEvent(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h3>Edit Event Info</h3>
              <form className="event-modal-form" onSubmit={handleEditEvent}>
                <input
                  type="text"
                  name="name"
                  placeholder="Event Name"
                  value={editEventForm.name}
                  onChange={handleEditEventChange}
                  required
                />
                <input
                  type="date"
                  name="date"
                  placeholder="Event Date"
                  value={editEventForm.date}
                  onChange={handleEditEventChange}
                  required
                />
                <input
                  type="text"
                  name="eventType"
                  placeholder="Event Type"
                  value={editEventForm.eventType}
                  onChange={handleEditEventChange}
                  required
                />
                <input
                  type="text"
                  name="venue"
                  placeholder="Venue"
                  value={editEventForm.venue}
                  onChange={handleEditEventChange}
                />
                {editEventError && <div className="event-modal-error">{editEventError}</div>}
                {editEventSuccess && <div className="event-modal-success">{editEventSuccess}</div>}
                <button type="submit">Save Changes</button>
              </form>
            </div>
          </div>
        )}
        {/* Add Photos Modal */}
        {showAddPhotos && (
          <div className="event-modal-backdrop">
            <div className="event-modal">
              <button className="event-modal-close" onClick={() => setShowAddPhotos(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h3>Add Photos</h3>
              <form className="event-modal-form" onSubmit={handleAddPhotos}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  disabled={photoUploading}
                />
                {photoError && <div className="event-modal-error">{photoError}</div>}
                {photoSuccess && <div className="event-modal-success">{photoSuccess}</div>}
                {photoUploading && (
                  <div className="photo-uploading-spinner" style={{ margin: '1rem 0', textAlign: 'center' }}>
                    <span className="loading-spinner">
                      <span className="spinner-dot"></span>
                      <span className="spinner-dot"></span>
                      <span className="spinner-dot"></span>
                      <span className="spinner-dot"></span>
                    </span>
                    <div>Uploading photos...</div>
                  </div>
                )}
                <button type="submit" disabled={photoUploading}>
                  {photoUploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
              {photoFiles.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {photoFiles.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #23272f' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="event-card-gallery">
          {gallery.length === 0 ? (
            <p className="event-gallery-empty">No photos yet. Add some!</p>
          ) : (
            <div className="event-gallery-grid">
              {gallery.map((photo, idx) => (
                <div
                  key={idx}
                  className="event-gallery-img-container"
                  onClick={() => setEnlargedImage(photo.url)}
                >
                  <img
                    src={photo.rederUrl}
                    alt={photo.name}
                    className="event-gallery-img"
                  />
                  {/* Download button */}
                  <a
                    href={photo.dowloadUrl}
                    className="event-gallery-download-btn"
                    title="Download"
                    download={photo.name || `photo-${idx}`}
                    onClick={e => e.stopPropagation()} // Prevent modal open
                  >
                    <i className="fa-solid fa-download"></i>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Enlarged Image Modal */}
        {enlargedImage && (
          <div className="event-modal-backdrop" onClick={() => setEnlargedImage(null)}>
            <div
              className="event-modal"
              style={{
                background: 'transparent',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                minWidth: 0,
                cursor: 'zoom-out'
              }}
            >
              <img
                src={enlargedImage}
                alt="Enlarged"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  borderRadius: 12,
                  boxShadow: '0 4px 32px 0 rgba(25, 118, 210, 0.13)'
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCard;