# Project Title

Toronto MLS Rets API

## Description

A node js express application that parses XML data into sqlite3 database and periodically performs cron tasks to update/delete.

## Getting Started

### Dependencies

* Node js, Redis

### Installing

* Initialize dependencies with `npm i`
* Initialize database by navigating to ./XmlParser/Residential and running ```node sqlite3schema.js```
* Parse initial data into the created database by navigating to ./XmlParser/Residential and running ```node index.js```

### Executing program

* How to run the program
```
npm start
```

## Software Logic

* XmlParser directory contains a module parseXml in index.js that can be called as ```parseXml(xmlPath, initialXmlObject, propertyType)``` where xmlPath is the xml file directory path, initialXmlObject is an existing object, and property type is currently "ResidentialDatabase"  
* parseXml module parses the data and returns a json object.
* XmlParser/Residential/index.js is a self executing function that loops through the object provided by parseXml and identifies photos associated with the property by searching through the specified Photos directory and matching photos with passed "MLS". This is necessary because the initial XML data has no reference to the number and names of associated Photos. 
The object is then written into a pre defined sqlite3 schema.
* XmlParser/images.js contains two modules "getMatchingFiles deleteMatchingFiles" which uses regex to identify images associated to a property and deletes respectively. This modules has been called through out the program.
* XmlParser/Residential/updateListing.js is a self executing function that parses XML data with latest updates retrieved from RETS connector. This is executed periodically via cron jobs.
The function identifies existing listings, tracks price changes or adds new listings into the sqlite3 database.
* XmlParser/Residential/deleteListing.js is a self executing function that removes inactive listings and their associated images by using data retrieved through RETS connector. The function is called periodically via cron jobs.

* Get request is made to the link ```localhost:3000/residential/Properties/```.
* Queries are cached via redis for faster delivery.
* Available queries include:
- "$limit" to limit number of responses. Default value of 10. 
- "$skip" to skip responses, used in conjunction for pagination.
- "$select" to return exact match. example: ```localhost:3000/residential/Properties/?$select=Municipality='Toronto',Link=true```
- $range to return range matches. The request needs to prefixed with "max" and "min" keyboard to specify range. Returns value equal or greather than max and equal or lesser than min. 
example:```localhost:3000/residential/Properties/?$range=minBedrooms=1,maxBedrooms=3```