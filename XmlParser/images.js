const fs = require('fs');

function getMatchingFiles(directory, mlsIndex) {
    return new Promise((resolve, reject) => {
        const mlsPattern = new RegExp(`^Photo${mlsIndex}-(\\d+)\\.jpeg$`, 'i');

        fs.readdir(directory, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            const matchingFiles = files.filter(file => file.match(mlsPattern));

            if (matchingFiles.length === 0) {
                // Reject the promise when no matching files are found
                reject(new Error('No matching files found.'));
            } else {
                // Resolve the promise with the length of matching files
                resolve(matchingFiles.length);
            }
        });
    });
}

module.exports = {
    getMatchingFiles,
};
