const fs = require('fs');
const path = require('path');
const sax = require('sax');

//Initializing sqllite3 database in reference to the initializeXmlObject
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../Data/Residential/residentialDatabase.db');

const xmlPath = '../Data/Residential/Delete/sample_delete.xml';
const directoryPath = '../Data/Residential/Photos/';

const { deleteMatchingFiles } = require('../images');

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
        currentProperty = {}; // Creating a new object instance
    } else if (insideResidentialProperty && currentElement === 'Listing') {
        insideListing = true;
    }
});

parser.on('text', (text) => {

    // Accumulate the text content if inside a Listing
    if (insideListing) {
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

        // Use Promise.all to wait for all asynchronous operations
        Promise.all(residentialProperties.map(async (property) => {
            return new Promise(async (resolve) => {
                db.get('SELECT * FROM residentialDatabase WHERE MLS = ?', property.MLS, async (err, row) => {
                    if (err) {
                        console.error('Error querying database:', err);
                        resolve();
                    } else {
                        if (row) {
                            try { 
                                await deleteMatchingFiles(directoryPath, property.MLS);

                            } catch (err) {
                                console.error('Error:', err.message);
                            }

                            // Row with MLS exists, perform a DELETE
                            db.run(
                                `DELETE FROM residentialDatabase
                                WHERE MLS = ?`,
                                [property.MLS],
                                (err) => {
                                    if (err) {
                                        console.error('Error deleting property from the database:', err);
                                    }
                                    resolve();
                                }
                            );
                        } else {
                            // Property with the given MLS doesn't exist in the database
                            console.log(`Property with MLS ${property.MLS} does not exist in the database`);
                            resolve();
                        }
                    }
                });
            });
        })).then(() => {
            // Commit the transaction after all updates are done
            db.run('COMMIT');

            endTime = new Date().getTime();
            console.log(`${counter} properties in ${(endTime - startTime) / 1000} seconds`);
        });
    });
});

// Pipe the XML file into the sax parser
fs.createReadStream(xmlPath)
    .pipe(parser)
    .on('error', (err) => {
        console.error('Error parsing XML:', err);
    });

