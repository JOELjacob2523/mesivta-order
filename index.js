const express = require('express');
const app = express();
const config = require('./config.json')

app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
    res.send(`I'm the Mesivta order file`)
})

app.listen(config.PORT, () => {
    console.log(`Server is now running at port ${config.PORT}`)
})