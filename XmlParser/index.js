const fs = require('fs');
const path = require('path');
const sax = require('sax');

//Initializing an object with 255 keys and values set to null
const initializeXmlObject = require('./xmlConfig');

//Initializing sqllite3 database in reference to the initializeXmlObject
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./Data/Residential/residentialDatabase.db');

const xmlPath = './Data/Residential/initial_data.xml';

const { getMatchingFiles } = require('./images');

const directoryPath = './Data/Residential/Photos/'

// Creating a sax parser
const parser = sax.createStream(true, { trim: true, normalize: true });

// Setting up variables to keep track of the current element
let currentElement = '';
let insideResidentialProperty = false;
let insideListing = false;

// Setting up data structures
let residentialProperties = [];
let currentProperty = {};
let endTime;
let counter = 0;
let startTime = new Date().getTime();

// let booleanFinder = [];

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
    // Loop through each property
    for (const property of residentialProperties) {

        property.MinListPrice = property.ListPrice;

        property.MaxListPrice = property.ListPrice;

        getMatchingFiles(directoryPath, property.MLS)
            .then(result => {
                currentProperty.PhotoCount = result;
                // Create an array of objects numbered as PhotoCount
                const photoLinks = Array.from({ length: property.PhotoCount }, (_, index) => `localhost:3000/residentialPhotos/Photo${property.MLS}-${index + 1}.jpeg`);
                // Assign the array to the PhotoLink key
                property.PhotoLink = JSON.stringify(photoLinks);
            })
            .catch(err => {
                console.error('Error:', err.message);
                // Handle the case when no matching files are found
            });

        const keys = Object.keys(property);
        const values = Object.values(property);

        const placeholders = values.map(() => '?').join(', ');
        const insertStatement = `INSERT INTO residentialDatabase (${keys.join(', ')}) VALUES (${placeholders})`;

        // Insert the property into the database
        await db.run(insertStatement, values);
    }

    endTime = new Date().getTime();

    db.close();

    console.log(`${counter} properties in ${(endTime - startTime) / 1000} seconds`);

});

// Pipe the XML file into the sax parser
fs.createReadStream(xmlPath)
    .pipe(parser)
    .on('error', (err) => {
        console.error('Error parsing XML:', err);
    });
