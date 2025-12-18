const BASE_URL = 'https://api.pixialbum.com';

// Store JWT in localStorage after login
export const authenticateUser = async (body) => {
  const response = await fetch(`${BASE_URL}/authenticate/user`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  const data = await response.json();
  return data;
};

// Store JWT in localStorage after registration (if applicable)
export const createUser = async (body) => {
  const response = await fetch(`${BASE_URL}/create/user`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return data;
};

// Helper to get JWT from localStorage
export const getJwtToken = () => {
  console.log(document.cookie);
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt_token='))
    ?.split('=')[1] || null;
};

// Send JWT in Authorization header for authenticated requests
export const fetchUserDetails = async (userId) => {
  const token = getJwtToken();
  const response = await fetch(
    `${BASE_URL}/v1/fetch/user/details?userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
  );
  return handleResponse(response);
};

/**
 * Fetch events summary for the logged-in user.
 * @param {Object} params - { page: number, limit: number }
 * @returns {Promise<Array>} - Resolves to an array of event summaries
 */
export async function fetchEventsSummary({ page, limit } = {}) {
  const token = getJwtToken && getJwtToken();
  const url = `${BASE_URL}/v1/fetch/events/summary?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  const data = handleResponse(response);
  return data || { events: [], total: 0 };
}

// Create a new event (POST /v1/new/event)
export const createEvent = async ({ eventName, venueName, eventDate, eventType }) => {
  const token = getJwtToken();
  const response = await fetch(`${BASE_URL}/v1/new/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventName,
      venueName,
      eventDate,
      eventType
    }),
    credentials: 'include'
  });
  return handleResponse(response);
};

export const fetchEventTypes = async () => {
  const token = getJwtToken && getJwtToken();
  const response = await fetch(`${BASE_URL}/v1/valid/event/types`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await handleResponse(response);
  return data.eventTypes;
};

/**
 * Upload a photo to the backend for a specific event.
 * @param {File} imageFile - The image file to upload.
 * @param {string} eventId - The event ID to associate the image with.
 * @returns {Promise<Object>} - Resolves to the uploaded image info or error.
 */
export const uploadEventImage = async (imageFile, eventId) => {
  const token = getJwtToken();
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${BASE_URL}/v1/upload/image`, {
    method: 'POST',
    headers: {
      'event_id': eventId
      // Note: Do NOT set 'Content-Type' header when using FormData; browser will set it automatically
    },
    body: formData,
    credentials: 'include'
  });
  return handleResponse(response);
};

/**
 * Fetch the list of images for a specific event.
 * @param {string} eventId - The event ID to fetch images for.
 * @param {number} page - Page number for pagination (default: 1).
 * @param {number} limit - Number of images per page (default: 20).
 * @returns {Promise<Array>} - Resolves to an array of image URLs.
 */
export const fetchEventImages = async (eventId, page = 1, limit = 10) => {
  const token = getJwtToken();
  const response = await fetch(
    `${BASE_URL}/v1/fetch/images?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'event_id': eventId
      },
      credentials: 'include'
    }
  );
  const data = await handleResponse(response);
  return {
    images: data.images || [],
    hasMorePages: data.hasMorePages || false
  };
};

/**
 * Fetch event summary by event ID.
 * @param {string} eventId - The event ID to fetch.
 * @returns {Promise<Object>} - Resolves to the event summary object.
 */
export const getEventsById = async (eventId) => {
  const token = getJwtToken();
  const response = await fetch(`${BASE_URL}/v1/fetch/event/${eventId}`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
};

/**
 * Create a viewer user for an event.
 * @param {Object} params - { name, email, password, eventId }
 * @returns {Promise<Object>} - Resolves to the backend response.
 */
export const createEventViewer = async ({ name, email, password, eventId }) => {
  const token = getJwtToken();
  const response = await fetch(`${BASE_URL}/v1/create/event/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: {
        userId: name,
        emailId: email,
        password: password,
        userType: 'VIEWER'
      },
      eventId
    }),
    credentials: 'include'
  });
  return handleResponse(response);
};

/**
 * Fetch all viewer users for a specific event.
 * @param {string} eventId - The event ID to fetch viewers for.
 * @returns {Promise<Array>} - Resolves to an array of viewer user objects.
 */
export const fetchEventViewers = async (eventId) => {
  const token = getJwtToken();
  const response = await fetch(
    `${BASE_URL}/v1/fetch/event/users?eventId=${encodeURIComponent(eventId)}`,
    {
      method: 'GET',
      credentials: 'include'
    }
  );
  return handleResponse(response);
};

/**
 * Handle fetch response status codes.
 * Redirects to /login if unauthorized (401 or 403).
 * @param {Response} response
 * @returns {Promise<any>} - Resolves to parsed JSON or throws error.
 */
function handleResponse(response) {
  if (response.status === 401 || response.status === 403) {
    window.location.href = '/roleselect';
    return;
  }
  if (!response.ok) {
    const data = response.json();
    throw new Error(data.error || 'Request failed');
  }
  return response.json();
}

/**
 * Fetch a single event by its ID.
 * @param {string} eventId - The ID of the event to fetch.
 * @returns {Promise<Object>} - Resolves to the event object.
 */
export const fetchEventById = async (eventId) => {
  const token = getJwtToken();
  const response = await fetch(`${BASE_URL}/v1/fetch/event/${eventId}`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
};

export const fetchLikedImages = async (eventId, imageIds) => {
  const token = getJwtToken();
  const params = new URLSearchParams();
  params.append('eventId', eventId);
  imageIds.forEach(id => params.append('imageIds', id));
  const response = await fetch(`${BASE_URL}/v1/fetch/images/list?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await handleResponse(response);
  return {
    images: data.images || [],
    hasMorePages: data.hasMorePages || false
  };
};