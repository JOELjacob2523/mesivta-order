const express = require('express');
const app = express();
const config = require('./config.json');
const path = require('path');
const session = require('express-session');
const productRouter = require('./routes/productRouter')

app.set('view engine', 'ejs');

app.use(
    session({
      secret: process.env.TOKEN_KEY,
      resave: false,
      saveUninitialized: false
    })
  );

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(productRouter)

app.get('/', (req, res, next) => {
    res.render('login')
})

app.listen(config.PORT, () => {
    console.log(`Server is now running at port ${config.PORT}`)
})