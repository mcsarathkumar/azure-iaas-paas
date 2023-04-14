const express = require('express');
const sql = require('mssql');
const app = express();

const port = process.env.PORT || 3000;

// Create SQL Server connection configuration
const config = {
    server: process.env.SERVER, // Update with your SQL Server hostname
    database: process.env.DB, // Update with your SQL Server database name
    user: process.env.USER, // Update with your SQL Server username
    password: process.env.PASS, // Update with your SQL Server password
    options: {
        encrypt: true // Use SSL encryption
    }
};

// Connect to SQL Server
sql.connect(config)
    .then(() => {
        console.log(port);
        console.log('Connected to SQL Server');
    })
    .catch(err => {
        console.error('Error connecting to SQL Server: ' + err);
    });

// Define a route for the root endpoint
app.get('/', (req, res) => {
    // Query the SQL Server to retrieve user details
    new sql.Request().query('SELECT * FROM UserDetails')
        .then(results => {
            // Render retrieved user details as HTML
            res.send(`
                <html>
                    <head>
                        <title>User Details</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    </head>
                    <body>
                    <div class="container mt-5">
                        <h1 class="mb-4">User Details</h1>
                        <table class="table">
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>City</th>
                            </tr>
                            ${results.recordset.map(result => `
                                <tr>
                                    <td>${result.UserID}</td>
                                    <td>${result.FirstName}</td>
                                    <td>${result.LastName}</td>
                                    <td>${result.Email}</td>
                                    <td>${result.City}</td>
                                </tr>
                            `).join('')}
                        </table>
                        </div>
                    </body>
                </html>
            `);
        })
        .catch(err => {
            console.error('Error querying SQL Server: ' + err);
            res.status(500).send('Error querying SQL Server');
        });
});

// Start the Express server

app.listen(port, () => {
    console.log('Server started on http://localhost:' + port);
});
