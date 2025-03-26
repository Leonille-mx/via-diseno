// Import required dependencies
const axios = require("axios"); // Axios is a library for making HTTP requests in Node.js
const NodeCache = require("node-cache"); // NodeCache is used to store data temporarily in memory
const dotenv = require("dotenv"); // dotenv helps load environment variables from a .env file

// Load environment variables from a .env file, which is useful for storing API keys securely
dotenv.config();

// Initialize a cache instance to store the authentication token
// This helps avoid unnecessary API requests by storing the token temporarily
const cache = new NodeCache();

// Create an Axios instance with a predefined base URL
// This makes it easier to send requests to the Admin API without repeating the full URL every time
const axiosAdminClient = axios.create({
  baseURL: process.env.ADMIN_API_URL, // The base URL is set from an environment variable
});

// Function to get an authentication token
async function getToken() {
  let token = cache.get("token"); // Check if the token is already stored in cache

  if (token) {
    return token; // If the token is found in cache, return it to avoid making another request
  }

  console.log("Fetching new token"); // Log a message when fetching a new token
  
  // Prepare authentication credentials required for Machine-to-Machine (M2M) authentication
  const m2m_credentials = {
    client_id: process.env.ADMIN_API_M2M_CLIENT_ID, // The client ID is stored securely in an environment variable
    client_secret: process.env.ADMIN_API_M2M_CLIENT_SECRET, // The client secret is also stored securely
  };

  // Send a request to authenticate and obtain a new token
  const response = await axiosAdminClient.post(
    "/m2m/authenticate", // API endpoint for authentication
    m2m_credentials // Send the credentials as the request body
  );

  token = response.data.token; // Extract the token from the API response
  cache.set("token", token); // Store the token in cache to reuse it for future requests

  return token; // Return the token so it can be used in API requests
}

// Function to generate headers containing the authentication token
// These headers must be included in each API request to verify authentication
function getHeaders(token) {
  return {
    Authorization: `Bearer ${token}`, // The token is included in the Authorization header
  };
}

async function getAllStudents() {
    const token = await getToken();
    const headers = await getHeaders();
    
    const response = await axiosAdminClient.get("v1/users/all", {
      headers,
      params: {
        type: "Users::Student",  
      }
    }); 
    return response.data;
}

// Export the functions so they can be used in other files
module.exports = { getAllStudents }
