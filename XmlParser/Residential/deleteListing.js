const parseXmlAsync = require('..');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../Data/Residential/residentialDatabase.db');

const util = require('util');
const dbGetAsync = util.promisify(db.get).bind(db);

const xmlPath = '../Data/Residential/Delete/sample_delete.xml';
const directoryPath = '../Data/Residential/Photos/';

const { deleteMatchingFiles } = require('../images');

(async () => {
    let startTime = new Date().getTime();

    try {
        const deleteProperties = await parseXmlAsync(xmlPath, initialXmlObject = () => { return { MLS: null } }, propertyType = 'ResidentialProperty');

        // Begin a transaction
        db.run('BEGIN TRANSACTION');

        for (const property of deleteProperties) {
            let oldPropertyValue = await checkIfPropertyExists(property.MLS);

            if (oldPropertyValue) {
                await deleteMatchingFiles(directoryPath, property.MLS);

                // Delete rows from the SQLite database
                await new Promise((resolve, reject) => {
                    db.run('DELETE FROM residentialDatabase WHERE MLS = ?', [property.MLS], function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } 
        }

        // Commit the transaction
        db.run('COMMIT');

    } catch (error) {
        console.error('Error:', error);

    } finally {
        // Close the SQLite database connection
        db.close();

        let endTime = new Date().getTime();
        const durationInSeconds = (endTime - startTime) / 1000;
        console.log(`Total time for delete operation ${durationInSeconds}`);
    }
})();


const checkIfPropertyExists = async (MLS) => {
    try {
        const row = await dbGetAsync('SELECT * FROM residentialDatabase WHERE MLS = ?', MLS);
        if (row) {
            return row;
        } else {
            return false;
        };

    } catch (err) {
        console.error('Error querying database:', err);
        throw err;
    }
}
