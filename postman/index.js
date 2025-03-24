// index.js (Main Application File)

// Import required dependencies
const express = require('express'); // Express is a web framework for building APIs and web servers
const { getUserById, getUserGroups, getCycleIndex, getAllUsers } = require('./adminApiClient'); // Import the functions we created earlier
const path = require('path');
const coordinadorRoutes = require('./routes/coordinador.routes.js');
app.use('/coordinador', coordinadorRoutes);

// Initialize an Express application
const app = express();
const port = 3000; // Define the port number where the server will run

// Serve static files from the public directory
app.use(express.static('public'));

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to fetch user details based on user ID
// This route listens for GET requests at /v1/users/find_one/:id
// :id =>  a route parameter in Express.js
// Acts as a placeholder that captures dynamic values from the URL
// Express will replace ':id' with the actual value in the request
// Ex) GET /v1/users/find_one/100007
// :id is replaced with 100007
// And you can access this value in the function using req.params.id
app.get('/v1/users/find_one/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id); // Call the function to get user data
    res.send(user); // Send the retrieved user data as a response
  } catch (error) {
    console.error(error); // Log any errors that occur
    res.status(500).send('Error fetching user'); // Send an error response if something goes wrong
  }
});

// Route to fetch user groups based on cycle ID and user ID
// This route listens for GET requests at /v1/school_cycles/user_groups_index/:cycle_id/:user_ivd_id
app.get(
  '/v1/school_cycles/user_groups_index/:cycle_id/:user_ivd_id',
  async (req, res) => {
    try {
      const userGroups = await getUserGroups(
        req.params.cycle_id, // Extract cycle ID from the request URL
        req.params.user_ivd_id, // Extract user ID from the request URL
      );
      res.send(userGroups); // Send the retrieved user groups as a response
    } catch (error) {
      console.error(error); // Log any errors that occur
      res.status(500).send('Error fetching user'); // Send an error response if something goes wrong
    }
  },
);

app.get('/v1/school_cycles/index', async (req, res) => {
  try {
    const schoolCycles = await getCycleIndex(); 
    res.send(schoolCycles); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching school cycles');
  }
});

app.get('/v1/users/all/:userType', async (req, res) => {
  try{
    const allUsers = await getAllUsers(req.params.type);
    res.send(allUsers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching school cycles');
  }
});



// Start the Express server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log a message indicating the server is running
});
