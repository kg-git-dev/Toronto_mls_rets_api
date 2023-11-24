const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../XmlParser/Data/Residential/residentialDatabase.db');
const db = new sqlite3.Database(dbPath);

const Property = (req, res) => {

    const minimumValue = req.query.minValue || 0; // default to 0 if not provided
    const maximumValue = req.query.maxValue || Number.MAX_SAFE_INTEGER; // default to max safe integer if not provided

    const query = `
        SELECT 
            Address, 
            Area, 
            AreaCode 
        FROM residentialDatabase 
        WHERE CAST(ListPrice AS REAL) >= ? AND CAST(ListPrice AS REAL) <= ?
    `;

    db.all(query, [minimumValue, maximumValue], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const result = {
                count: rows.length,
                properties: rows
            };
            res.json(result);
        }
    });
};

module.exports = Property;



