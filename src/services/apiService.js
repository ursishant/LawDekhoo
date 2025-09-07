/**
 * A centralized service for handling all API communications.
 */

// The environment variable has been replaced with the hardcoded URL.
const API_BASE_URL = (typeof window !== 'undefined' && window.__API_BASE_URL__) || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

// Safe request helper to avoid "Unexpected end of JSON input" errors
const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      // Try to parse JSON if looks like JSON
      if (text && text.trim().startsWith('{')) {
        try { data = JSON.parse(text); } catch { data = text; }
      } else {
        data = text;
      }
    } catch (_) {
      data = null;
    }
  }
  if (!response.ok) {
    const message = (data && (data.error || data.message)) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
};

/**
 * Sends a chat message payload to the backend.
 * @param {Array<object>} contents - The message content payload for the API.
 * @returns {Promise<string>} - A promise that resolves to the bot's response text.
 * @throws {Error} - Throws an error if the API request fails.
 */
export const postToChat = async (contents) => {
  try {
    const data = await request(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!botResponseText) {
      throw new Error('Invalid response format from API');
    }

    return botResponseText;
  } catch (error) {
    console.error('API Service Error:', error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};


/**
 * Fetches and scrapes content from a given URL via the backend.
 * @param {string} url - The URL to scrape.
 * @returns {Promise<string>} - A promise that resolves to the scraped text content.
 * @throws {Error} - Throws an error if the scraping request fails.
 */
export const fetchUrlContent = async (url) => {
    try {
        const data = await request(`${API_BASE_URL}/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        return data.text;
    } catch (error) {
        console.error('URL Fetching Error:', error);
        throw error;
    }
};

/**
 * Auth API helpers
 */
export const signup = async ({ name, email, password }) => {
  const data = await request(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return data;
};

export const login = async ({ email, password }) => {
  const data = await request(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return data;
};

export const fetchMe = async (token) => {
  const data = await request(`${API_BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return data;
};

export const updateProfile = async (token, { name, phone, socials }) => {
  const data = await request(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, phone, socials })
  });
  return data;
};
