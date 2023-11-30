const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test_qt',
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;