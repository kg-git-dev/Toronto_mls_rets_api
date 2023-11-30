const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../XmlParser/Data/Residential/residentialDatabase.db');

const Properties = async (req, res) => {
    // Access the modified query from the request object
    const modifiedQuery = req.databaseQuery;

    let results;
    let isCached = false;

    try {
        const cacheResults = await req.redisClient.get(modifiedQuery);

        if (cacheResults) {
            isCached = true;
            results = JSON.parse(cacheResults);
            return res.json({ isCached, results });
        } else {
            const db = new sqlite3.Database(dbPath);

            db.all(modifiedQuery, async (err, rows) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).send('Internal Server Error');
                } else {
                    results = rows;
                    await req.redisClient.set(modifiedQuery, JSON.stringify(results));
                    res.json({ isCached, results });
                }
            });

            db.close();
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = Properties;
