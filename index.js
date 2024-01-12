const express = require('express');
const app = express();
const session = require('express-session');
const config = require('./config.json');
const path = require('path');
const productRouter = require('./routes/productRouter');
const bodyParser = require('body-parser');

app.use(
    session({
      secret: process.env.TOKEN_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {maxAge: 3600000},
    })
  );
  
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(productRouter)

app.get('/', (req, res, next) => {
    res.render('login')
})

const server = app.listen(config.PORT, () => {
    console.log(`Server is now running at http://localhost:${config.PORT}`)
})

server.keepAliveTimeout = 15 * 1000;
server.headersTimeout = 16 * 1000;