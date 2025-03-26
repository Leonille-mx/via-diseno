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

// Function to fetch user details based on user ID
async function getUserById(id) {
  const token = await getToken(); // Obtain an authentication token
  const headers = getHeaders(token); // Generate request headers using the token

  // Make a GET request to the API to fetch user information
  const response = await axiosAdminClient.get("v1/users/find_one", {
    headers, // Include authentication headers
    params: {
      // Has to specify id as ivd_id since that's the required query parameter name in the API.
      // and id is a variable in the JS code
      ivd_id: id, // Send the user ID as a query parameter
    },
  });
  return response.data; // Return the API response data
}

// Function to fetch user groups for a given cycle ID
async function getUserGroups(cycle_id, user_ivd_id) {
  const token = await getToken(); // Obtain an authentication token
  const headers = getHeaders(token); // Generate request headers using the token

  // Make a GET request to the API to fetch user groups
  const response = await axiosAdminClient.get(
    "v1/school_cycles/user_groups_index", // API endpoint for user groups
    {
      headers, // Include authentication headers
      params: {
        // Use the value of cycle_id and send it as id in the API request.
        id: cycle_id, // Send the cycle ID as a query parameter
        // JavaScript automatically assumes that the key should be the same as the variable name.
        // This is called shorthand property notation.
        user_ivd_id, // Send the user ID as a query parameter
      },
    }
  );
  return response.data; // Return the API response data
}

async function getCiclosEscolares() {
  try {
    const token = await getToken();
    const headers = getHeaders(token);
    
    const response = await axiosAdminClient.get("v1/school_cycles/index", { headers });
    
    // Access the nested data array
    const responseData = response.data.data;
    
    if (!Array.isArray(responseData)) {
      throw new Error("Invalid API response format - expected array in data property");
    }

    return responseData.map(cycle => ({
      code: cycle.code,  // Use actual code field from response
      start_date: new Date(cycle.start_date),
      end_date: new Date(cycle.end_date)
    }));
    
  } catch (error) {
    console.error("API Error:", error.config?.url, error.response?.status);
    throw new Error(`School cycles fetch failed: ${error.message}`);
  }
}


// Export the functions so they can be used in other files
module.exports = { 
  getCiclosEscolares 
};