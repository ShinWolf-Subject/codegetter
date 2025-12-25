const express = require('express');
const axios = require('axios');
const router = express.Router();

// CORS proxy endpoint
router.post('/fetch-html', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Invalid URL format. Include http:// or https://' 
      });
    }

    console.log(`Fetching HTML from: ${url}`);

    // Set timeout and headers to mimic a real browser
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    console.log(`Successfully fetched HTML from: ${url}`);

    res.json({
      success: true,
      html: response.data,
      contentType: response.headers['content-type'],
      status: response.status
    });

  } catch (error) {
    console.error('Fetch error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ 
        error: 'Website not found. Check the URL and try again.' 
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `Website returned error: ${error.response.status} ${error.response.statusText}` 
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout. The website took too long to respond.' 
      });
    }

    res.status(500).json({ 
      error: `Failed to fetch HTML: ${error.message}` 
    });
  }
});

module.exports = router;
