// In Controllers/ResidentialControllers/Properties.js

const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const Properties = (req, res) => {
    // Access the modified query from the request object
    const modifiedQuery = req.databaseQuery;

    // Logic to execute the modified query
    // Execute the SQLite query and send the response
    const dbPath = path.resolve(__dirname, '../../XmlParser/Data/Residential/residentialDatabase.db');
    const db = new sqlite3.Database(dbPath);

    db.all(modifiedQuery, (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });

    db.close();
};

module.exports = Properties;
