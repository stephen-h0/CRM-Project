const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: '192.168.50.158',       // Replace with your MySQL host (use 'localhost' or your Raspberry Pi's IP address)
  user: 'root',            // Your MySQL username
  password: 'Aa89909000',// Your MySQL password
  database: 'crm_project', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the connection pool to use it in other files
module.exports = pool;
