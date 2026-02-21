const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "thermalprinters"
});

module.exports = db;
