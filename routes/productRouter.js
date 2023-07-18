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
      const { user, userId } = await Controller.confirmUser(req.body.username, req.body.email, req.body.password, req.body.building);
      req.session.token = user.token;
      req.session.userId = userId;
      res.redirect('/order');
    } catch (error) {
      console.error('Error inserting user credentials:', error);
      //res.redirect('incorrect-login');
    }
  });

  /*Router.get('/view', async (req, res, next) => {
    try{      
    let users = await Controller.getAllUsers(req.session.userId);
    console.log(users)
    for (let user of users) {
      user.done = user.done ? true : false;
    }
    res.render('view', { users: users });
  }catch(err){
    console.error(err);
    res.redirect('/login');
  }});*/

  Router.get('/order', async (req, res, next) => {
    try{
    let users = await Controller.getAllUsers(req.session.userId);
    res.render('order', { users });
  }catch(err){
    console.error(err);
    res.redirect('/login');
  }});

  Router.get('/create', (req, res, next) => {
    res.render('create-product');
  })

  Router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      if (err){
        res.status(400).send('Unable to logout');
      } else {
        res.redirect('/login');
      }
    });
  });  

module.exports = Router;