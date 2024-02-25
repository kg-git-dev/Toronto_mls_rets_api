const parseXmlAsync = require('..');
const xmlPath = '../Data/Commercial/initial_data.xml';
const imageDirectoryPath = '../Data/Commercial/Photos/';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../Data/Commercial/commercial_properties_database.db');

const util = require('util');
const dbRunAsync = util.promisify(db.run).bind(db);

const initialXmlObject = require('./xmlConfig');
const { getMatchingFiles } = require('../images');

(async () => {
    try {
        let startTime = new Date().getTime();

        const commercialProperties = await parseXmlAsync(xmlPath, initialXmlObject, propertyType = 'CommercialProperty');

        console.log('commercial ran')

        for (const property of commercialProperties) {
            property.MinListPrice = property.ListPrice;
            property.MaxListPrice = property.ListPrice;

            try {
                const fileNames = await getMatchingFiles(imageDirectoryPath, property.MLS);
            
                if (fileNames.length > 0) {
                    property.PhotoCount = fileNames.length;
            
                    // Map file names to web links
                    const photoLinks = fileNames.map((fileName, index) => fileName);
            
                    // Assign the array to the PhotoLink key
                    property.PhotoLink = JSON.stringify(photoLinks);
                } else {
                    // No matching files, handle this case
                    property.PhotoCount = 0; // or set it to null or any default value
                    property.PhotoLink = null; // or set it to any default value
                }
            } catch (err) {
                console.error('Error:', err.message);
            }
            
            
            const keys = Object.keys(property);
            const values = Object.values(property);

            const placeholders = values.map(() => '?').join(', ');
            const insertStatement = `INSERT INTO commercial_properties_table (${keys.join(', ')}) VALUES (${placeholders})`;

            console.log('commited to commercial database for MLS ID:', property.MLS)

            // Insert the property into the database
            try {
                await dbRunAsync(insertStatement, values);
            } catch (error) {
                console.error('Error inserting commercial property into the database:', error);
                // You may choose to throw the error to propagate it up or handle it as needed.
                throw error;
            }
        }

        let endTime = new Date().getTime();

        const durationInSeconds = (endTime - startTime) / 1000; // Convert milliseconds to seconds

        console.log(`Total time for initial read/write search operation ${durationInSeconds}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the database connection when done
        db.close();
    }
})();