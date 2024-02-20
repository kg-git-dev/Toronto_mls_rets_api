const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(
    __dirname,
    "../XmlParser/Data/Residential/residentialDatabase.db"
);

router.get("/", async (req, res) => {
    try {
        let { searchTerm } = req.query;
        
        // Extract searchTerm from the query parameters and sanitize
        if (searchTerm) {
            searchTerm = searchTerm.replace(/'/g, ""); // Remove single quotes
            searchTerm = searchTerm.toLowerCase(); // Convert to lowercase
            searchTerm = searchTerm.trim(); // Trim whitespace
        } else {
            res.status(400).json({ error: "Missing searchTerm parameter" });
            return;
        }

        const searchTerms = searchTerm.split(" "); // Split search term into individual words
        
        const placeholders = searchTerms.map(() => "LOWER(SearchAddress) LIKE ?").join(" OR "); // Create placeholders for each search term
        
        const query = `
            SELECT MLS, Street, StreetName, StreetAbbreviation, Area, Province, SearchAddress 
            FROM residentialDatabase 
            WHERE ${placeholders}`; 

        // Execute the query with the sanitized search terms as parameters
        const db = new sqlite3.Database(dbPath);

        const params = searchTerms.map(term => `%${term}%`);

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error("Error executing query:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }

            // Calculate scores for each row based on the number of matched keywords
            rows.forEach(row => {
                const searchAddress = row.SearchAddress.toLowerCase();
                let score = 0;
                searchTerms.forEach(term => {
                    if (searchAddress.includes(term)) {
                        score++;
                    }
                });
                row.score = score;
            });

            // Sort the rows based on the score in descending order
            rows.sort((a, b) => b.score - a.score);

            // Return only the top 10 matches
            const top10Matches = rows.slice(0, 10);

            // Send the top 10 matches as the response
            res.json(top10Matches);
        });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error at /searchAddress route');
    }
});

module.exports = router;
