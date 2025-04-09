const express = require('express');
const axios = require('axios');
const app = express();

// Replace with your actual Shopify credentials
// const SHOP_DOMAIN = 'your-store.myshopify.com';
// const API_KEY = 'your-api-key';
// const API_PASSWORD = 'your-api-password';

const SHOP_DOMAIN = 'frido-usa.myshopify.com';
const API_KEY = 'abf4fb1724ec8dbd639711d1e6c6c6fc';
const API_PASSWORD = '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';

// Endpoint to verify API credentials by listing files
app.get('/verify-credentials', async (req, res) => {
  try {
    console.log('Attempting to verify Shopify API credentials...');
    console.log(`Shop Domain: ${SHOP_DOMAIN}`);
    console.log(`API Key: ${API_KEY.substring(0, 4)}...`); // Only show first 4 chars for security
    
    // Make a request to list files (GET request is safer for testing)
    const response = await axios({
      method: 'GET',
      url: `https://${SHOP_DOMAIN}/admin/api/2023-04/files.json`,
      auth: {
        username: API_KEY,
        password: API_PASSWORD
      }
    });
    
    console.log('API Connection Successful!');
    console.log(`Found ${response.data.files.length} files in your Shopify store`);
    
    // Print details of up to 5 files
    const filesToShow = response.data.files.slice(0, 5);
    filesToShow.forEach((file, index) => {
      console.log(`File ${index + 1}:`);
      console.log(`  - ID: ${file.id}`);
      console.log(`  - URL: ${file.url}`);
      console.log(`  - Created: ${file.created_at}`);
      console.log(`  - Type: ${file.content_type}`);
    });
    
    res.json({
      success: true,
      message: 'API credentials verified successfully',
      fileCount: response.data.files.length
    });
  } catch (error) {
    console.error('Error verifying credentials:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    console.error('Error config:', error.config);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify API credentials',
      error: error.message
    });
  }
});

// Simple home route
app.get('/', (req, res) => {
  res.send('Server is running. Try /verify-credentials to test Shopify API connection.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/verify-credentials to test your API credentials`);
});