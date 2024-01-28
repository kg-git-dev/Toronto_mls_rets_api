const express = require("express");

const path = require("path");

const redis = require("redis");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

//importing residential, commercial and condos routes
const residentialRoutes = require("./Routes/residential");

//importing getLatLong routes
const getLatLongRoutes = require("./Routes/getLatLong");

// Create Redis client
const redisClient = redis.createClient();
redisClient.on("error", (error) => console.error(`Redis Error: ${error}`));
redisClient.connect();

// Create Redis client for get-lat-long routes with a different database
const getLatLongRedisClient = redis.createClient({ db: 1 }); 
getLatLongRedisClient.on("error", (error) => console.error(`GetLatLong Redis Error: ${error}`));
getLatLongRedisClient.connect();

// Pass the Redis client to the routes
app.use((req, res, next) => {
  req.redisClient = redisClient;
  req.getLatLongRedisClient = getLatLongRedisClient;
  next();
});

//make images available
app.use(
  "/residentialPhotos",
  express.static(path.join(__dirname, "XmlParser/Data/Residential/Photos/"))
);

//Seperating routes into residential, commercial and condos
app.use("/residential", residentialRoutes);

//Integrating get-lat-long-queue
app.use("/get-lat-long", getLatLongRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
