const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios'); // Add axios for making HTTP requests

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS
app.use(cors());

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint that doesn't require file upload
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Received file:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to base64 string for cloudinary
    const fileStr = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype;
    
    // Create data URI
    const fileUri = `data:${fileType};base64,${fileStr}`;
    
    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    console.log('Upload successful:', uploadResponse.secure_url);
    res.json({ secure_url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

// Function to keep the server alive by pinging itself
const keepAlive = (serverUrl) => {
  setInterval(async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/ping`);
      console.log(`Server ping at ${new Date().toISOString()}: ${response.data.status}`);
    } catch (error) {
      console.error('Error pinging server:', error.message);
    }
  }, 14 * 60 * 1000); // 14 minutes in milliseconds
};

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload`);
  
  // Start the keep-alive mechanism
  const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
  keepAlive(serverUrl);
});