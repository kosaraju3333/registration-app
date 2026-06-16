const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'automation',
    password: '',
    database: 'user_provisioning'
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
    } else {
        console.log("Connected to MySQL");
    }
});

module.exports = db;
