const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../XmlParser/Data/Residential/residentialDatabase.db');
const db = new sqlite3.Database(dbPath);

// Middleware to handle optional query parameters
const handleOptionalParameters = (req, res, next) => {
    const { $limit, $skip, $select } = req.query;

    // Modify the database query based on the optional parameters
    const limit = $limit || 10;
    const skip = $skip || 0; // Default to 0 if $skip is not provided

    const selectFields = parseSelectParameters($select);

    const databaseQuery = buildDatabaseQuery({
        limit,
        skip,
        selectFields,
    });

    // Attach the modified query to the request object for later use
    req.databaseQuery = databaseQuery;

    next();
};

const buildDatabaseQuery = ({ limit, skip, selectFields }) => {
    let query = 'SELECT * FROM residentialDatabase';

    // Add WHERE clause for boolean and string conditions
    const conditions = [];

    // Add conditions for each field in the $select query
    selectFields.forEach(field => {
        const [fieldName, value] = field.split('=');

        // Check if the value is a boolean or string
        if (value === 'true' || value === 'false') {
            conditions.push(`${fieldName} = ${value}`);
        } else {
          // Remove surrounding quotes and enclose in single quotes
          const stringValue = value.replace(/^'|'$/g, '');
          conditions.push(`${fieldName} = '${stringValue}'`);
        }
    });

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add LIMIT and OFFSET clauses
    query += ` LIMIT ${limit} OFFSET ${skip}`;

    return query;
};


// Example function to parse select parameters
const parseSelectParameters = (select) => {
    if (!select) {
        return [];
    }

    // Split the $select parameters
    return select.split(',');
};

module.exports = {
    handleOptionalParameters,
};
