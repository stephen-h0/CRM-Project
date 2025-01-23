const mysql = require('mysql2');

const pool = mysql.createPool({
  // Connection settings
  host: '192.168.50.158',
  user: 'root',
  password: 'root',
  database: 'crm_project',

  // Pool configuration
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,

  // MariaDB settings
  multipleStatements: true,
  charset: 'utf8mb4',
  supportBigNumbers: true,
  dateStrings: true
});

// Test connection with MariaDB specific error handling
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
      console.error('Authentication method not supported. Try:', err);
      console.error('ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'root\';');
      console.error('FLUSH PRIVILEGES;');
    } else {
      console.error('Error connecting to MariaDB:', err);
    }
    process.exit(1);
  }
  console.log('Successfully connected to MariaDB');
  connection.release();
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

module.exports = pool;