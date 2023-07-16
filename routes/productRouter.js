const Router = require('express').Router();
const Controller = require('../controllers/products');

Router.get('/signup', (req, res, next) => {
    res.render('signup');
})

Router.post('/signup', async(req, res, next) => {
    try{
      await Controller.createUser(req.body.username, req.body.email, req.body.password, req.body.building);
      res.redirect('/login')
    } catch(error){
      console.error('Error inserting user credentials:', error);    
      //res.redirect('wrong-signup-msg')
    }
  });

Router.get('/login', (req, res, next) => {
    res.render('login');
})

Router.post('/login', async (req, res, next) => {
    try {
      const { user, userId } = await Controller.confirmUser(req.body.username, req.body.password);
      req.session.token = user.token;
      req.session.userID = userId;
      res.redirect('/view');
    } catch (error) {
      console.error('Error inserting user credentials:', error);
      //res.redirect('incorrect-login');
    }
  });

module.exports = Router;