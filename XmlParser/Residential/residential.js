const fs = require('fs');

// Specify the path to the XML file you want to watch
const path = require('path');
const currentDirectory = process.cwd();
const xmlFilePath = path.resolve(currentDirectory, 'XmlParser', 'Data', 'Residential', 'Updates', 'sampleUpdates.xml');

// Function to execute when the file changes
const handleFileChange = () => {
    // Replace this with your logic to parse the XML and update the database
    console.log('File changed! Triggering parsing and database update...');
    // Your parsing and database update logic goes here
};

// Watch for changes to the XML file
fs.watch(xmlFilePath, (eventType, filename) => {
    if (filename) {
        // Handle the file change event
        handleFileChange();
    }
});

// Log that the file watching has started
console.log(`Watching for changes to ${xmlFilePath}`);
