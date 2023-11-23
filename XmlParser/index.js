const fs = require('fs');
const sax = require('sax');

//Initializing an object with 255 keys and values set to null
const initializeXmlObject = require('./xmlConfig');

const xmlPath = './Data/sampleData.xml';

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
    // Testing for null values
    if (text === 'null') text = null;

    // Testing for boolean
    if (text === 'Y') { text = true } else if (text === 'N') { text = false };

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
        counter++
    } else if (insideResidentialProperty && nodeName === 'Listing') {
        insideListing = false;
    }
});

parser.on('end', () => {
    // Log the structured data
    endTime = new Date().getTime();

    console.log(`${counter} properties in ${(endTime - startTime)} seconds`);

    const jsonOutput = JSON.stringify(residentialProperties, null, 2);
    fs.writeFileSync('./Data/output.json', jsonOutput, 'utf-8');
    console.log('Data saved to output.json');
});

// Pipe the XML file into the sax parser
fs.createReadStream(xmlPath)
    .pipe(parser)
    .on('error', (err) => {
        console.error('Error parsing XML:', err);
    });
