const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS
const pool = require('./db'); // Import the database connection
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express(); // Initialize Express
const PORT = 3000; // Define the server port

// Enable CORS middleware
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Profilo CRM!');
});

// First fix database schema
const fixColumnOrderQuery = `
ALTER TABLE customers 
MODIFY COLUMN  DateToJoin AFTER Country;
`;

// GET: Fetch all customers or search for matches
app.get('/customers', (req, res) => {
  const { q, page = 1, pageSize = 10 } = req.query; // Extract the 'q', 'page', and 'pageSize' parameters from the request query

  // Log the query parameters for debugging
  console.log('Query parameters:', { q, page, pageSize });

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  // Define the query and parameters
  const query = q
    ? `SELECT * FROM customers WHERE 
        CustomerID = ? OR 
        FirstName LIKE ? OR 
        LastName LIKE ? OR 
        Email LIKE ? OR 
        Phone LIKE ?
        LIMIT ? OFFSET ?`
    : 'SELECT * FROM customers LIMIT ? OFFSET ?';

  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, limit, offset] : [limit, offset];

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

// GET: Fetch a single customer by ID
app.get('/customers/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM customers WHERE CustomerID = ?';
  pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching customer:', err);
      res.status(500).send('Error fetching customer');
    } else if (results.length === 0) {
      res.status(404).send('Customer not found');
    } else {
      res.json(results[0]); // Return the customer as JSON
    }
  });
});

// Update POST endpoint
app.post('/customers', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country } = req.body;

    if (!FirstName || !LastName || !Email || !Phone) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const query = `
      INSERT INTO customers 
      (FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      FirstName, LastName, Email, Phone,
      Address || '', City || '', State || '',
      PostalCode || '', Country || ''
    ];

    pool.query(query, values, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }

      const newCustomer = {
        CustomerID: results.insertId,
        DateToJoin: new Date().toISOString().split('T')[0],
        FirstName,
        LastName,
        Email,
        Phone,
        Address,
        City,
        State,
        PostalCode,
        Country
      };

      res.status(201).json(newCustomer);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Update an existing customer by ID
app.put('/customers/:id', (req, res) => {
  const { id } = req.params; // Extract the customer ID from the URL
  const { FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country } = req.body; // Extract fields from the request body

  // Ensure all required fields are provided
  if (!FirstName || !LastName || !Email || !Phone) {
    console.error('Validation error: All fields are required');
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    UPDATE customers
    SET FirstName = ?, LastName = ?, Email = ?, Phone = ?,
        Address = ?, City = ?, State = ?, PostalCode = ?, Country = ?
    WHERE CustomerID = ?
  `;
  // Use 'id' for the WHERE clause
  pool.query(query, 
    [FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country, id],
    (err, results) => {
      if (err) {
        console.error('Error updating customer:', err);
        return res.status(500).json({ error: 'Error updating customer' });
      } else if (results.affectedRows === 0) {
        console.error('Customer not found:', id);
        return res.status(404).json({ error: 'Customer not found' });
      } else {
        console.log('Customer updated successfully:', id);
        res.json({ message: 'Customer updated successfully' });
      }
    }
  );
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

// GET: Search for customers by phone, name, or email
app.get('/customers/search', (req, res) => {
  const { phone, name, email } = req.query; // Extract phone, name, and email from query params
  let query = `
    SELECT CustomerID, DateToJoin, FirstName, LastName, Email, Phone, 
           Address, City, State, PostalCode, Country, LastContact, Status 
    FROM customers WHERE 1=1
  `;
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

// Add CSV upload endpoint
app.post('/customers/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let lineNumber = 1;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      lineNumber++;
      // Validate required fields
      if (!data.FirstName || !data.LastName || !data.Email || !data.Phone) {
        errors.push(`Line ${lineNumber}: Missing required fields`);
        return;
      }
      results.push(data);
    })
    .on('end', async () => {
      if (errors.length > 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors 
        });
      }

      try {
        const values = results.map(row => [
          row.FirstName.trim(),
          row.LastName.trim(),
          row.Email.trim(),
          row.Phone.trim(),
          (row.Address || '').trim(),
          (row.City || '').trim(),
          (row.State || '').trim(),
          (row.PostalCode || '').trim(),
          (row.Country || '').trim()
        ]);

        const query = `
          INSERT INTO customers 
          (FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country)
          VALUES ?
        `;

        const [result] = await pool.query(query, [values]);
        fs.unlinkSync(req.file.path);
        
        res.json({
          success: true,
          inserted: result.affectedRows,
          total: results.length
        });
      } catch (error) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
      }
    });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CRM server is running at http://localhost:${PORT}`);
});