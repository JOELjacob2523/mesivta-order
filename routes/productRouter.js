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

  Router.get('/order', async (req, res, next) => {
    try{
    let users = await Controller.getAllUsers(req.session.userId);
    let vendors = await Controller.getVendors();
    res.render('order', { users, vendors });
  }catch(err){
    res.redirect('/login');
    console.error(err);    
  }});  

  Router.post('/createVendor', async (req, res, next) =>{
    try{
      await Controller.createVandor(req.body.vendorname, req.body.companyname, req.body.vendoremail, req.body.phone);
      res.redirect('/order');
    }
    catch(err){
      console.error(err);
    }
  });

  Router.post('/updateVendor', async(req, res, next) => {
    try{
      let id = req.body.vendors;
      const {vendorId} = await Controller.updateVendor(req.session.vendorname, id, req.session.vendoremail);
      req.session.vendorId = vendorId

      res.redirect('/viewProducts');
    }catch(err){
      res.redirect('/updateVendor')
      console.error(err)
    }
  });

  Router.get('/main', (req, res, next) => {
    res.redirect('/order')
  })

  Router.get('/viewProducts', async(req, res, next) => {
    const vendorId = req.session.vendorId;
    const products = await Controller.getAll(vendorId);
    const vendors = await Controller.getVendors();
    res.render('view-products', {products, vendors, vendorId});
  });

  Router.post('/createProduct', async(req, res, next) => {
    try{
      const product = {
        description: req.body.description,
        perCase: req.body.perCase,
        price: req.body.price,
        vendorId: req.session.vendorId
      }
      await Controller.createProduct(product);
      res.redirect('/viewProducts');
    } catch(err){
      console.error(err)
    }
  });

  Router.post('/orderDetails', async (req, res, next) => {
    try{

      const order = {
        date: new Date(),
        vendorId: req.session.vendorId
      }
      const products = {
        amount: req.body.amount,
        productdesc: req.body.productdesc,
        qty: req.body.qty,
        price: req.body.price,
        totalboxes: req. body.totalboxes,
        totalprice: req.body.totalprice,
        vendorId: req.session.vendorId
      }
      const { amount, productdesc, qty, price, totalboxes, totalprice, vendorId } = products;

      const productItems = [];

      const numProducts = amount.length;

      for (let i = 0; i < numProducts; i++) {
      const productItem = {
        amount: amount[i],
        productdesc: productdesc[i],
        qty: qty[i],
        price: price[i],
        totalboxes: totalboxes[i],
        totalprice: totalprice[i],
        vendorId: vendorId
      };

      productItems.push(productItem);
    }

      await Controller.orders(order);
      for (const productItem of productItems){
      await Controller.orderDetails(productItem);
      }
      res.redirect('/viewProducts')

    }catch(err){
    console.error(err)
    }
  });

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