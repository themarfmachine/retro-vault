require('dotenv').config();
const axios = require('axios');

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

// Function to get a valid OAuth access token from Twitch
async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('IGDB credentials missing in .env');
    return null;
  }

  // Check if we already have a valid token (adding a 60s buffer)
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    accessToken = response.data.access_token;
    // Set expiry based on current time + expires_in (seconds) * 1000
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Failed to get IGDB access token:', error.message);
    return null;
  }
}

const PLATFORM_MAP = {
  'Arcade': 52,
  'Dreamcast': 23,
  'GB': 33,
  'GBC': 22,
  'GameCube': 21,
  'N64': 4,
  'NES': 18,
  'PlayStation': 7,
  'SNES': 19,
  'Sega Genesis': 29,
  'Xbox': 11
};

// Function to search for a game and return its cover URL
async function getGameCover(title, platform) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    let query = `search "${title}"; fields cover.url; limit 1;`;
    
    // Add platform filter if platform is mapped
    const platformId = PLATFORM_MAP[platform];
    if (platformId) {
      query = `search "${title}"; where platforms = [${platformId}]; fields cover.url; limit 1;`;
    }

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      query,
      {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data && response.data.length > 0 && response.data[0].cover && response.data[0].cover.url) {
      // IGDB returns URLs like //images.igdb.com/igdb/image/upload/t_thumb/co1xyz.jpg
      let url = response.data[0].cover.url;
      
      // Ensure https prefix
      if (url.startsWith('//')) {
        url = 'https:' + url;
      }

      // Replace t_thumb with t_cover_big for high-resolution images
      url = url.replace('t_thumb', 't_cover_big');
      
      return url;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch cover for "${title}":`, error.message);
    return null;
  }
}

module.exports = {
  getGameCover
};
