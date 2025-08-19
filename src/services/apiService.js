/**
 * A centralized service for handling all API communications.
 */

// The environment variable has been replaced with the hardcoded URL.
const API_BASE_URL = "http://localhost:3001/api";

/**
 * Sends a chat message payload to the backend.
 * @param {Array<object>} contents - The message content payload for the API.
 * @returns {Promise<string>} - A promise that resolves to the bot's response text.
 * @throws {Error} - Throws an error if the API request fails.
 */
export const postToChat = async (contents) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

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
        const response = await fetch(`${API_BASE_URL}/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to scrape the URL.');
        }
        return data.text;
    } catch (error) {
        console.error('URL Fetching Error:', error);
        throw error;
    }
};
