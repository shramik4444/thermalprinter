
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0112358',
  database: 'thermalprinters_database'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});



// sdn dsnd sk sdkn sk
async function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      message VARCHAR(255) DEFAULT NULL
    )
  `;

  try {
    await db.promise().query(createTableQuery);
    console.log("Table 'items' created or already exists.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    db.end();
  }
}

createTable();



