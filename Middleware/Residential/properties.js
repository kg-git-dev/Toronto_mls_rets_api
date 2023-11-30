const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../XmlParser/Data/Residential/residentialDatabase.db');
const db = new sqlite3.Database(dbPath);

// Middleware to handle optional query parameters
const handleOptionalParameters = (req, res, next) => {
    const { $limit, $skip, $select, $range } = req.query;

    const key = 'testing';
    const value = 'someValue';

    // Modify the database query based on the optional parameters
    const limit = $limit || 10;
    const skip = $skip || 0; // Default to 0 if $skip is not provided

    const selectFields = parseSelectParameters($select);

    const rangeFields = parseRangeParameters($range);

    const databaseQuery = buildDatabaseQuery({
        limit,
        skip,
        selectFields,
        rangeFields,
    });

    // Attach the modified query to the request object for later use
    req.databaseQuery = databaseQuery;

    next();
};

const buildDatabaseQuery = ({ limit, skip, selectFields, rangeFields }) => {
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

    const rangeValues = {};

    rangeFields.forEach(field => {
        const [fieldName, value] = field.split('=');
        const match = fieldName.match(/^(min|max)/);

        if (match) {
            const minMaxType = match[0]; // "min" or "max"
            const key = fieldName.substring(3); // Remove "min" or "max" from the field name

            // Store the value based on the minMaxType and key
            rangeValues[minMaxType] = rangeValues[minMaxType] || {};
            rangeValues[minMaxType][key] = parseInt(value);
        }
    })

    Object.entries(rangeValues).forEach(([minMaxType, values]) => {
        Object.entries(values).forEach(([key, value]) => {
            const operator = minMaxType === 'min' ? '>=' : '<=';
            conditions.push(`CAST(${key} AS REAL) ${operator} CAST(${value} AS REAL)`);
        });
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

const parseRangeParameters = (range) => {
    if (!range) {
        return [];
    }

    // Split the $range parameters
    return range.split(',');


};


module.exports = {
    handleOptionalParameters,
};
