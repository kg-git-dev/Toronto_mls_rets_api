const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(
  __dirname,
  "../../XmlParser/Data/Residential/residentialDatabase.db"
);

const Properties = async (req, res) => {
  let results;
  const databaseQuery = req.databaseQuery;
  try {
    const cacheResults = await req.redisClient.get(databaseQuery);

    if (cacheResults) {
      results = JSON.parse(cacheResults);
      return res.json({ type: "cached", results });
    } else {
      SaveInRedis(req, res, databaseQuery);
    }

  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
};

const SaveInRedis = async (req, res, databaseQuery) => {
  const db = new sqlite3.Database(dbPath);
  try {
    db.all(databaseQuery, async (err, rows) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
      } else {
        await req.redisClient.set(databaseQuery, JSON.stringify(rows));
        res.json({ type: "new", results: rows });
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
  db.close();
};

module.exports = Properties;
