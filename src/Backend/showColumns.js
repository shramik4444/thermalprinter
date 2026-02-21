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

async function showColumns() {


  const query = `SHOW COLUMNS FROM items`;

  try {
    const [rows, fields] = await db.promise().query(query);
    console.log("Columns in 'items' table:");
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (error) {
    console.error("Error fetching columns:", error);
  } finally {
    db.end();
  }
}

showColumns();  