const parseXmlAsync = require('..');
const xmlPath = '../Data/Residential/Updates/sampleUpdates.xml';
const imageDirectoryPath = '../Data/Residential/Photos/';
const initialXmlObject = require('./xmlConfig');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../Data/Residential/residentialDatabase.db');

const util = require('util');
const dbGetAsync = util.promisify(db.get).bind(db);

const { getMatchingFiles } = require('../images');

(async () => {
    let transaction;
    let startTime = new Date().getTime();

    try {
        // Begin a transaction
        transaction = await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });

        const residentialProperties = await parseXmlAsync(xmlPath, initialXmlObject, propertyType = 'ResidentialProperty');
       
        const clauseCollection = [];

        for (const property of residentialProperties) {
            let oldPropertyValue = await checkIfPropertyExists(property.MLS);

            if (oldPropertyValue) {
                await propertyExistsTrue(oldPropertyValue, property, clauseCollection);
            } else {
                await propertyExistsFalse(property, clauseCollection);
            }
        }

        // Execute each SQL statement in the clauseCollection array
        for (const query of clauseCollection) {
            await new Promise((resolve, reject) => {
                db.run(query.sql, query.params, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this);
                    }
                });
            });
        }

        // Commit the transaction
        await new Promise((resolve, reject) => {
            db.run('COMMIT', function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);

        // Roll back the transaction in case of an error
        if (transaction) {
            await new Promise((resolve, reject) => {
                db.run('ROLLBACK', function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this);
                    }
                });
            });
        }
        
    } finally {
        // Close the database connection when done
        db.close();

        let endTime = new Date().getTime();
        const durationInSeconds = (endTime - startTime) / 1000;
        console.log(`Total time for update ${durationInSeconds}`);
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

const propertyExistsTrue = async (oldPropertyValue, property, clauseCollection) => {
    if (oldPropertyValue.ListPrice !== property.ListPrice) {
        
        // Check if ListPrice is lower or equal to MinListPrice
        if (property.ListPrice <= oldPropertyValue.MinListPrice) {
            console.log(`Assigning ListPrice ${property.ListPrice} to MinListPrice.`);
            property.MinListPrice = property.ListPrice;
        }

        // Check if ListPrice is equal or higher than MaxListPrice
        if (property.ListPrice >= oldPropertyValue.MaxListPrice) {
            console.log(`Assigning ListPrice ${property.ListPrice} to MaxListPrice.`);
            property.MaxListPrice = property.ListPrice;
        }
    }

    // Compare PixUpdtedDt values
    if (oldPropertyValue.PixUpdtedDt !== property.PixUpdtedDt) {

        // pixUpdatedAt has changed, perform another action
        console.log(`pixUpdatedAt for property with MLS ${property.MLS} has changed. Performing another action...`);

        try {
            const fileNames = await getMatchingFiles(imageDirectoryPath, property.MLS);

            if (fileNames.length > 0) {
                property.PhotoCount = fileNames.length;

                // Map file names to web links
                const photoLinks = fileNames.map((fileName, index) => `localhost:3000/residentialPhotos/${fileName}`);

                // Assign the array to the PhotoLink key
                property.PhotoLink = JSON.stringify(photoLinks);
            }
        } catch (err) {
            console.error('Error:', err.message);
        }
    }
    const keys = Object.keys(property);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = Object.values(property);

    const updateStatement = `UPDATE residentialDatabase SET ${setClause} WHERE MLS = ?`;

    clauseCollection.push({
        sql: updateStatement,
        params: [...values, property.MLS],
    });
}

const propertyExistsFalse = async (property, clauseCollection) => {

    property.MinListPrice = property.ListPrice;
    property.MaxListPrice = property.ListPrice;

    try {
        const fileNames = await getMatchingFiles(imageDirectoryPath, property.MLS);

        if (fileNames.length > 0) {
            property.PhotoCount = fileNames.length;

            // Map file names to web links
            const photoLinks = fileNames.map((fileName, index) => `localhost:3000/residentialPhotos/${fileName}`);

            // Assign the array to the PhotoLink key
            property.PhotoLink = JSON.stringify(photoLinks);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }

    const keys = Object.keys(property);
    const placeholders = keys.map(() => '?').join(', ');

    const insertStatement = `INSERT INTO residentialDatabase (${keys.join(', ')}) VALUES (${placeholders})`;

    clauseCollection.push({
        sql: insertStatement,
        params: Object.values(property),
    });
}
