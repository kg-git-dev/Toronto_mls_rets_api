const express = require("express");
// const cors = require('cors');

const path = require("path");

const redis = require("redis");

const app = express();

// app.use(cors);

const PORT = process.env.PORT || 3000;

//importing residential, commercial and condos routes
const residentialRoutes = require("./Routes/residential");

// Create Redis client
const redisClient = redis.createClient();
redisClient.on("error", (error) => console.error(`Redis Error: ${error}`));
redisClient.connect();

// Pass the Redis client to the routes
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

//make images available
app.use(
  "/residentialPhotos",
  express.static(path.join(__dirname, "XmlParser/Data/Residential/Photos/"))
);

//Seperating routes into residential, commercial and condos
app.use("/residential", residentialRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
