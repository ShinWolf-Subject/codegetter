const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

// Middleware
app.use(express.json());
app.use(express.static(publicDir));

// Import routes with error handling
let fetchRoutes;
try {
  fetchRoutes = require('./routes/fetch');
  app.use('/api', fetchRoutes);
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error.message);
  // Create a basic fallback route
  app.post('/api/fetch-html', (req, res) => {
    res.status(500).json({ 
      error: 'Routes not properly configured. Please check server logs.' 
    });
  });
}

// Serve the main page
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HTML Getter - Setup Required</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 5px; }
          code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>HTML Code Getter</h1>
        <div class="error">
          <h2>Setup Required</h2>
          <p>The <code>public/index.html</code> file is missing. Please create it with the HTML content provided.</p>
          <p>Check the terminal for setup instructions.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Public directory: ${publicDir}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});
