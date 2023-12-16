const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(
  __dirname,
  "../../XmlParser/Data/Residential/residentialDatabase.db"
);
const db = new sqlite3.Database(dbPath);

const handleOptionalParameters = (req, res, next) => {
  const { $limit, $skip, $select, $range } = req.query;

  const limit = $limit || 10;
  const skip = $skip || 0;

  const selectFields = parseSelectParameters($select);
  const rangeFields = parseRangeParameters($range);

  const databaseQuery = buildDatabaseQuery({
    limit,
    skip,
    selectFields,
    rangeFields,
  });

  req.databaseQuery = databaseQuery;

  next();
};

const buildDatabaseQuery = ({ limit, skip, selectFields, rangeFields }) => {
  const query = "SELECT * FROM residentialDatabase";
  const conditions = [];

  addSelectConditions(conditions, selectFields);
  addRangeConditions(conditions, rangeFields);

  if (conditions.length > 0) {
    return addLimitOffset(
      query + ` WHERE ${conditions.join(" AND ")}`,
      limit,
      skip
    );
  }

  return addLimitOffset(query, limit, skip);
};

const addSelectConditions = (conditions, selectFields) => {
  selectFields.forEach((field) => {
    const [fieldName, value] = field.split("=");
    const condition = getConditionString(fieldName, value);
    conditions.push(condition);
  });
};

const addRangeConditions = (conditions, rangeFields) => {
  const rangeValues = {};

  rangeFields.forEach((field) => {
    const [fieldName, value] = field.split("=");
    const match = fieldName.match(/^(min|max)/);

    if (match) {
      const minMaxType = match[0];
      const key = fieldName.substring(3);

      rangeValues[minMaxType] = rangeValues[minMaxType] || {};
      rangeValues[minMaxType][key] = parseInt(value);
    }
  });

  Object.entries(rangeValues).forEach(([minMaxType, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      const operator = minMaxType === "min" ? ">=" : "<=";
      conditions.push(
        `CAST(${key} AS REAL) ${operator} CAST(${value} AS REAL)`
      );
    });
  });
};

const getConditionString = (fieldName, value) => {
  if (value === "true" || value === "false") {
    return `${fieldName} = ${value}`;
  }

  const stringValue = value.replace(/^'|'$/g, "");
  return `${fieldName} = '${stringValue}'`;
};

const addLimitOffset = (query, limit, skip) => {
  return query + ` LIMIT ${limit} OFFSET ${skip}`;
};

const parseSelectParameters = (select) => (select ? select.split(",") : []);

const parseRangeParameters = (range) => (range ? range.split(",") : []);

module.exports = {
  handleOptionalParameters,
};
