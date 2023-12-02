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
const parser = sax.createStream(true, { trim: true, normalize: true, lowercase: true });

// Setting up variables to keep track of the current element
let currentElement = '';
let insideResidentialProperty = false;
let insideListing = false;

// Setting up data structures
let residentialProperties = [];
let currentProperty = {};
let startTime;
let endTime;
let counter = 0;
// let booleanFinder = [];

// Setting up event handlers
parser.on('opentag', (node) => {
    // Update the current element
    currentElement = node.name;

    // Check if we are inside a ResidentialProperty or Listing
    if (currentElement === 'ResidentialProperty') {
        startTime = new Date().getTime();
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

        if (currentElement === 'MLS') {
            getMatchingFiles(directoryPath, text)
            .then(result => {
                currentProperty.PhotoCount = result;
              })
              .catch(err => {
                console.error('Error:', err.message);
                // Handle the case when no matching files are found
              });
        }
    

    }
});

parser.on('closetag', (nodeName) => {
    // Add the current property to the array when leaving ResidentialProperty
    if (nodeName === 'ResidentialProperty') {
        insideResidentialProperty = false;

        // Check if PhotoCount is greater than 0
        if (currentProperty.PhotoCount > 0) {
            // Create an array of objects numbered as PhotoCount
            const photoLinks = Array.from({ length: currentProperty.PhotoCount }, (_, index) => `localhost:3000/residentialPhotos/Photo${currentProperty.MLS}-${index + 1}.jpeg`);
            // Assign the array to the PhotoLink key
            currentProperty.PhotoLink = photoLinks;
        }

        residentialProperties.push(currentProperty);
        counter++;
    } else if (insideResidentialProperty && nodeName === 'Listing') {
        insideListing = false;
    }
});


parser.on('end', async () => {
    // Log the structured data
    endTime = new Date().getTime();

    // Loop through each property
    for (const property of residentialProperties) {
        // Check if PhotoCount is greater than 0
        if (property.PhotoCount > 0) {
            // Create an array of objects numbered as PhotoCount
            const photoLinks = Array.from({ length: property.PhotoCount }, (_, index) => `localhost:3000/residentialPhotos/Photo${property.MLS}-${index + 1}.jpeg`);
            // Assign the array to the PhotoLink key
            property.PhotoLink = JSON.stringify(photoLinks);
        }

        const keys = Object.keys(property);
        const values = Object.values(property);

        const placeholders = values.map(() => '?').join(', ');
        const insertStatement = `INSERT INTO residentialDatabase (${keys.join(', ')}) VALUES (${placeholders})`;

        // Insert the property into the database
        await db.run(insertStatement, values);
        console.log(`${counter} properties in ${(endTime - startTime)} seconds`);
    }


});

// Pipe the XML file into the sax parser
fs.createReadStream(xmlPath)
    .pipe(parser)
    .on('error', (err) => {
        console.error('Error parsing XML:', err);
    });
