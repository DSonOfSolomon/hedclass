
const mysql = require("mysql2");

// Create a connection object
// Stores the credentials needed to connect to the database
const connection = mysql.createConnection({
    host: "localhost",     
    user: "root",          
    password: "root",      
    database: "40490439",  
    port: 8889
});

// Attempt to connect to the database
connection.connect((err) => {

    
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    
    console.log("Connected to MySQL database.");
});

// Export the connection so other files can use it
module.exports = connection;