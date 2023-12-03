const fs = require('fs');
const path = require('path');
const sax = require('sax');

//Initializing an object with 255 keys and values set to null
const initializeXmlObject = require('../xmlConfig');

//Initializing sqllite3 database in reference to the initializeXmlObject
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../Data/Residential/residentialDatabase.db');

const xmlPath = '../Data/Residential/Updates/sampleUpdates.xml';

const { getMatchingFiles } = require('../images');

const directoryPath = '../Data/Residential/Photos/';

// Creating a sax parser
const parser = sax.createStream(true, { trim: true, normalize: true });

// Setting up variables to keep track of the current element
let currentElement = '';
let insideResidentialProperty = false;
let insideListing = false;

// Setting up data structures
let residentialProperties = [];
let currentProperty = {};
let startTime = new Date().getTime();
let endTime;
let counter = 0;

// Setting up event handlers
parser.on('opentag', (node) => {
    // Update the current element
    currentElement = node.name;

    // Check if we are inside a ResidentialProperty or Listing
    if (currentElement === 'ResidentialProperty') {
        insideResidentialProperty = true;
        currentProperty = { ...initializeXmlObject }; // Creating a new object instance
    } else if (insideResidentialProperty && currentElement === 'Listing') {
        insideListing = true;
    }
});

parser.on('text', (text) => {

    // Accumulate the text content if inside a Listing
    if (insideListing) {
        // Testing for null values
        if (text === 'null') text = null;

        // Testing for boolean
        if (text === 'Y') {
            text = 1;

        } else if (text === 'N') {
            text = 0;
        };

        currentProperty[currentElement] = text;

    }
});

parser.on('closetag', (nodeName) => {
    // Add the current property to the array when leaving ResidentialProperty
    if (nodeName === 'ResidentialProperty') {
        insideResidentialProperty = false;
        residentialProperties.push(currentProperty);
        counter++;
    } else if (insideResidentialProperty && nodeName === 'Listing') {
        insideListing = false;
    }
});

parser.on('end', async () => {
    // Wrap the updates in a transaction for efficiency
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Loop through each property
        for (const property of residentialProperties) {

            db.get('SELECT * FROM residentialDatabase WHERE MLS = ?', property.MLS, async (err, row) => {
                if (err) {
                    console.error('Error querying database:', err);
                } else {
                    // Check if the property with the given MLS exists in the database
                    if (row) {
                        // Compare ListPrice values
                        if (row.ListPrice !== property.ListPrice) {
                            // ListPrice has changed, perform an action
                            console.log(`ListPrice for property with MLS ${property.MLS} has changed. Performing action...`);

                            // Check if ListPrice is lower or equal to MinListPrice
                            if (property.ListPrice <= row.MinListPrice) {
                                // Assign ListPrice to MinListPrice
                                console.log(`Assigning ListPrice ${property.ListPrice} to MinListPrice.`);
                                property.MinListPrice = property.ListPrice;
                            }

                            // Check if ListPrice is equal or higher than MaxListPrice
                            if (property.ListPrice >= row.MaxListPrice) {
                                // Assign ListPrice to MaxListPrice
                                console.log(`Assigning ListPrice ${property.ListPrice} to MaxListPrice.`);
                                property.MaxListPrice = property.ListPrice;
                            }
                        }

                        // Compare PixUpdtedDt values
                        if (row.PixUpdtedDt !== property.PixUpdtedDt) {
                            // pixUpdatedAt has changed, perform another action
                            console.log(`pixUpdatedAt for property with MLS ${property.MLS} has changed. Performing another action...`);
                            try {
                                const result = await getMatchingFiles(directoryPath, property.MLS);
                                property.PhotoCount = result;

                                const photoLinks = Array.from({ length: property.PhotoCount }, (_, index) => `localhost:3000/residentialPhotos/Photo${property.MLS}-${index + 1}.jpeg`);
                                // Assign the array to the PhotoLink key
                                property.PhotoLink = JSON.stringify(photoLinks);
                            } catch (err) {
                                console.error('Error:', err.message);
                                // Handle the case when no matching files are found
                            }
                        }
                    } else {
                        // Property with the given MLS doesn't exist in the database
                        console.log(`Property with MLS ${property.MLS} does not exist in the database. Performing a different action...`);

                        property.MinListPrice = property.ListPrice;
                        property.MaxListPrice = property.ListPrice;

                        try {
                            const result = await getMatchingFiles(directoryPath, property.MLS);
                            property.PhotoCount = result;

                            const photoLinks = Array.from({ length: property.PhotoCount }, (_, index) => `localhost:3000/residentialPhotos/Photo${property.MLS}-${index + 1}.jpeg`);
                            // Assign the array to the PhotoLink key
                            property.PhotoLink = JSON.stringify(photoLinks);
                        } catch (err) {
                            console.error('Error:', err.message);
                            // Handle the case when no matching files are found
                        }
                    }

                    // Construct the SET clause dynamically based on property keys
                    const setClause = Object.keys(property).map(key => `${key} = ?`).join(', ');

                    // Execute the dynamic UPDATE statement
                    db.run(
                        `UPDATE residentialDatabase
                        SET ${setClause}
                        WHERE MLS = ?`,
                        [...Object.values(property), property.MLS],
                        (err) => {
                            if (err) {
                                console.error('Error updating property in the database:', err);
                            }
                        }
                    );
                }
            });
        }

        // Commit the transaction after all updates are done
        db.run('COMMIT');

    });
    endTime = new Date().getTime();
    console.log(`${counter} properties updated successfully.`);
    console.log(`${counter} properties in ${(endTime - startTime) / 1000} seconds`);
});


// Pipe the XML file into the sax parser
fs.createReadStream(xmlPath)
    .pipe(parser)
    .on('error', (err) => {
        console.error('Error parsing XML:', err);
    });

