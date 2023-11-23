const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

//importing residential, commercial and condos routes
const residentialRoutes = require('./Routes/residential');

//Seperating routes into residential, commercial and condos
app.use('/residential', residentialRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});