const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS
const pool = require('./db'); // Import the database connection

const app = express(); // Initialize Express
const PORT = 3000; // Define the server port

// Enable CORS middleware
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Profilo CRM!');
});
// GET: Fetch all customers or search for matches
app.get('/customers', (req, res) => {
  const { q } = req.query; // Extract the 'q' parameter from the request query

  // Log the query parameter for debugging
  console.log('Query parameter (q):', q);

  // Define the query and parameters
  const query = q
    ? `SELECT * FROM customers WHERE 
        CustomerID = ? OR 
        FirstName LIKE ? OR 
        LastName LIKE ? OR 
        Email LIKE ? OR 
        Phone LIKE ?`
    : 'SELECT * FROM customers';

  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`] : [];

  // Log the constructed query and parameters
  console.log('Executing query:', query);
  console.log('With parameters:', params);

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      res.status(500).send('Error fetching customers');
    } else {
      // Log query results for debugging
      console.log('Query results:', results);

      if (q && results.length === 0) {
        res.status(404).send('No matching customers found');
      } else {
        res.json(results); // Send filtered or all customers as JSON
      }
    }
  });
});


// POST: Add a new customer to MySQL
app.post('/customers', (req, res) => {
  const { FirstName, LastName, Email, Phone } = req.body;

  // Validate required fields
  if (!FirstName || !LastName || !Email || !Phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO customers (FirstName, LastName, Email, Phone)
    VALUES (?, ?, ?, ?)
  `;
  pool.query(query, [FirstName, LastName, Email, Phone], (err, results) => {
    if (err) {
      console.error('Error adding customer:', err);
      res.status(500).send('Error adding customer');
    } else {
      res.status(201).json({ id: results.insertId, FirstName, LastName, Email, Phone });
    }
  });
});

// PUT: Update an existing customer by ID
app.put('/customers/:id', (req, res) => {
  const { id } = req.params; // Extract the customer ID from the URL
  const { FirstName, LastName, Email, Phone } = req.body; // Extract fields from the request body

  // Ensure all required fields are provided
  if (!FirstName || !LastName || !Email || !Phone) {
    return res.status(400).send('All fields are required');
  }

  const query = `
    UPDATE customers
    SET FirstName = ?, LastName = ?, Email = ?, Phone = ?
    WHERE CustomerID = ?
  `;
  // Use 'id' for the WHERE clause
  pool.query(query, [FirstName, LastName, Email, Phone, id], (err, results) => {
    if (err) {
      console.error('Error updating customer:', err);
      res.status(500).send('Error updating customer');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Customer not found');
    } else {
      res.send('Customer updated successfully');
    }
  });
});

// DELETE: Remove a customer by ID
app.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM customers WHERE CustomerID = ?';
  pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting customer:', err);
      res.status(500).send('Error deleting customer');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Customer not found');
    } else {
      res.status(204).send(); // No content
    }
  });
});

app.get('/customers/search', (req, res) => {
  const { phone, name, email } = req.query; // Extract phone, name, and email from query params
  let query = 'SELECT * FROM customers WHERE 1=1'; // Base query
  const params = [];

  // Add conditions based on provided parameters
  if (phone) {
    query += ' AND Phone LIKE ?';
    params.push(`%${phone}%`);
  }
  if (name) {
    query += ' AND (FirstName LIKE ? OR LastName LIKE ?)';
    params.push(`%${name}%`, `%${name}%`);
  }
  if (email) {
    query += ' AND Email LIKE ?';
    params.push(`%${email}%`);
  }

  console.log(`Executing query: ${query} with params: ${params}`); // Log for debugging

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      res.status(500).send('Internal Server Error');
    } else if (results.length === 0) {
      res.status(404).send('No customers found');
    } else {
      res.json(results); // Return matching customers as JSON
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CRM server is running at http://localhost:${PORT}`);
});
