const express = require("express");

const getLatLong = require('get-lat-long-queue');

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { id, locationToSearch } = req.body;

        const result = await getLatLong(
            latLangRedisClient = req.getLatLongRedisClient,
            latLongQueueKey = 'latLongQueueKey',
            latLongLockKey = 'latLongLockKey',
            latLongLocalLockKey = 'latLongLocalLockKey',
            latLongProcessingKey = 'latLongProcessingKey',
            expirationTime = 5000,
            { id, locationToSearch },
            displayLogs = true,
        );
        res.status(200).send({ result });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error at /getLatLong route');
    }
});

module.exports = router;
