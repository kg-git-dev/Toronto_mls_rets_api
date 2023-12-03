const fs = require('fs');
const path = require('path');

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

function deleteMatchingFiles(directory, mlsIndex) {
    return new Promise(async (resolve, reject) => {
        const mlsPattern = new RegExp(`^Photo${mlsIndex}-(\\d+)\\.jpeg$`, 'i');

        fs.readdir(directory, async (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            const matchingFiles = files.filter(file => file.match(mlsPattern));

            if (matchingFiles.length === 0) {
                // Reject the promise when no matching files are found
                reject(new Error('No matching files found.'));
            } else {
                // Delete each matching file
                const deletePromises = matchingFiles.map(file => {
                    const filePath = path.join(directory, file);
                    return new Promise((resolve, reject) => {
                        fs.unlink(filePath, err => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });

                try {
                    // Wait for all file deletions to complete
                    await Promise.all(deletePromises);
                    console.log(`Deleted ${matchingFiles.length} matching files.`);
                    resolve(matchingFiles.length);
                } catch (error) {
                    console.error('Error deleting files:', error.message);
                    reject(error);
                }
            }
        });
    });
}

module.exports = {
    getMatchingFiles,
    deleteMatchingFiles
};
