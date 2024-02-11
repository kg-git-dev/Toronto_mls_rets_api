const fs = require('fs').promises;
const path = require('path');

const getMatchingFiles = async (directory, mlsIndex) => {
    try {
        const mlsPattern = new RegExp(`^Photo${mlsIndex}-(\\d+)\\.jpeg$`, 'i');

        const files = await fs.readdir(directory);

        const matchingFiles = files
            .filter(file => file.match(mlsPattern))
            .map(file => ({
                name: file,
                number: parseInt(file.match(mlsPattern)[1], 10)
            }))
            .sort((a, b) => a.number - b.number)
            .map(fileObj => fileObj.name);
   
        console.log('matching files found:', matchingFiles)
            
        return matchingFiles;
    } catch (err) {
        throw err;
    }
}

const deleteMatchingFiles = async (directory, mlsIndex) => {

    try {
        const matchingFiles = await getMatchingFiles(directory, mlsIndex);

        if (matchingFiles > 0) {
            await Promise.all(matchingFiles.map(async (file) => {
                const filePath = path.join(directory, file);
                await fs.unlink(filePath);
                console.log(`Deleted ${matchingFiles.length} files.`);
            }));
        }

    } catch (err) {
        console.log('errror deleting files');
    }
}



module.exports = {
    getMatchingFiles,
    deleteMatchingFiles
};
