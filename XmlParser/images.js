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
                return
            } else {
                resolve(matchingFiles.length);
            }
        });
    });
}


module.exports = { getMatchingFiles };
