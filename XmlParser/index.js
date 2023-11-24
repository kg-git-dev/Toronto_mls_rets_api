const fs = require('fs');
const sax = require('sax');

//Initializing an object with 255 keys and values set to null
const initializeXmlObject = require('./xmlConfig');

//Initializing sqllite3 database in reference to the initializeXmlObject
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./Data/Residential/residentialDatabase.db');

const xmlPath = './Data/Residential/initial_data.xml';

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
            // if (!booleanFinder.includes(currentElement)) {
            //     booleanFinder.push(currentElement);
            // }
        } else if (text === 'N') {
            text = 0;
            // if (!booleanFinder.includes(currentElement)) {
            //     booleanFinder.push(currentElement);
            // }
        };

        currentProperty[currentElement] = text;
    }
});

parser.on('closetag', (nodeName) => {
    // Add the current property to the array when leaving ResidentialProperty
    if (nodeName === 'ResidentialProperty') {
        insideResidentialProperty = false;
        residentialProperties.push(currentProperty);
        counter++
    } else if (insideResidentialProperty && nodeName === 'Listing') {
        insideListing = false;
    }
});

parser.on('end', () => {
    // Log the structured data
    endTime = new Date().getTime();

    //looping through each property and assigning values and keys
    residentialProperties.forEach((property) => {
        const keys = Object.keys(property);
        const values = Object.values(property);
      
        const insertStatement = `INSERT INTO residentialDatabase (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
      
        // Insert the property into the database
        db.run(insertStatement, values, (err) => {
          if (err) {
            console.error('Error inserting data:', err);
          } else {
            console.log('Data inserted successfully.');
          }
        });
      });
    // console.log(booleanFinder);

    // const jsonOutput = JSON.stringify(residentialProperties, null, 2);

    // fs.writeFileSync('./Data/sampleDataOutput.json', jsonOutput, 'utf-8');
    // console.log('Data saved to sampleDataOutput.json');

    console.log(`${counter} properties in ${(endTime - startTime)} seconds`);


});

// Pipe the XML file into the sax parser
fs.createReadStream(xmlPath)
    .pipe(parser)
    .on('error', (err) => {
        console.error('Error parsing XML:', err);
    });
