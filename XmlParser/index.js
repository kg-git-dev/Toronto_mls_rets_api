const fs = require('fs').promises;
const sax = require('sax');

const parseXml = async (xmlPath, initialXmlObject, propertyType) => {
    try {
        const xmlContent = await fs.readFile(xmlPath, 'utf-8');

        const parser = sax.createStream(true, { trim: true, normalize: true });
        let currentElement = '';
        let insidePropertyType = false;
        let insideListing = false;
        let propertyObject = [];
        let currentProperty = {};
        let counter = 0;
        let startTime = new Date().getTime();
        let endTime;

        parser.on('opentag', (node) => {
            currentElement = node.name;
            if (currentElement === propertyType) {
                currentProperty = { ...initialXmlObject }; // Creating a new object instance
                insidePropertyType = true;
            } else if (insidePropertyType && currentElement === 'Listing') {
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
            if (nodeName === propertyType) {
                insidePropertyType = false;
                propertyObject.push(currentProperty);
                counter++;
            } else if (insidePropertyType && nodeName === 'Listing') {
                insideListing = false;

            }
        });

        parser.on('end', () => {

            endTime = new Date().getTime();
            const durationInSeconds = (endTime - startTime) / 1000; // Convert milliseconds to seconds
            console.log(`XML Parser: ${counter} properties in ${durationInSeconds.toFixed(2)} seconds`);
        });

        parser.on('error', (err) => {
            console.error('Error parsing XML:', err);
        });

        parser.write(xmlContent);
        parser.end();

        return propertyObject;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

module.exports = parseXml;
