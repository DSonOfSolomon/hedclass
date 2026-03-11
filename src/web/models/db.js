// Import mysql2 package which allows Node.js to talk to MySQL
const mysql = require("mysql2");

// Create a connection object
// This stores the credentials needed to connect to the database
const connection = mysql.createConnection({
    host: "localhost",     
    user: "root",          
    password: "root",      
    database: "40490439",  
    port: 8889
});

// Attempt to connect to the database
connection.connect((err) => {

    // If there is an error connecting, print it to the console
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    // If successful, show confirmation
    console.log("Connected to MySQL database.");
});

// Export the connection so other files can use it
module.exports = connection;