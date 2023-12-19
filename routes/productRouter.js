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
    res.render('view-products', { products, vendors, vendorId });
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

  Router.post('/orderItems', async (req, res, next) => {
    try{

      const date = new Date();
      const year = date.toLocaleString('en-US', { year: "numeric" })
      const month = date.toLocaleString('en-US', { month: "2-digit" })
      const day = date.toLocaleString('en-US', { day: "2-digit" })
      const hour = date.toLocaleString('en-US', { hour: "2-digit", minute: "2-digit" })
      let time = `${month}/${day}/${year} ${hour}`

      await Controller.orders(time, req.session.vendorId);
      const orderid = await Controller.insertOrderId(req.session.vendorId)

      const products = {
        amount: req.body.amount,
        productdesc: req.body.productdesc,
        qty: req.body.qty,
        price: req.body.price,
        totalboxes: req.body.totalboxes,
        totalprice: req.body.totalprice,
        date: time,
        orderId: orderid,
        vendorId: req.session.vendorId        
      }

      const { amount, productdesc, qty, price, orderId, vendorId } = products;

      const productItems = [];

      const numProducts = amount.length;

      for (let i = 0; i < numProducts; i++) {
      const productItem = {
        amount: amount[i],
        productdesc: productdesc[i],
        qty: qty[i],
        price: price[i],
        date: time,
        orderId: orderId,
        vendorId: vendorId        
      };

      productItems.push(productItem);
    }

      for (const productItem of productItems){

        productItem.orderId = orderid;
        productItem.qty = parseFloat(productItem.qty);
        productItem.price = parseFloat(productItem.price);

      await Controller.orderDetails(productItem);
      await Controller.orderTotal(orderid, products.totalboxes, products.totalprice)
      }      
      await Controller.emailOrder(req.session.vendorId, req.session.userId, orderid)
      setTimeout( () => {
        res.redirect('/viewProducts')
      }, 1500)

    }catch(err){
      res.redirect('/login')
    console.error(err)
    }
  });

  Router.get('/edit/:productId', async(req, res, next) => {
    const products = await Controller.getId(req.params.productId);
    res.render('update', { products })
  });

  Router.post('/update', async(req, res, next) => {
    try{
      await Controller.updateProduct(req.body)
      setTimeout( () => {
        res.redirect('/viewProducts')
      }, 1500)
    }catch(err){
      console.error(err)
    }
  });

  Router.post('/delete', async(req, res, next) => {
    try{
      await Controller.deleteProduct(req.body.productId)
      setTimeout( () => {
        res.redirect('/viewProducts')
      }, 1500)
    }catch(err){
      console.error(err)
    }
  });

  Router.post('/betweenOrders', async(req, res, next) => {
    try{
      let from = req.body.from;
      let to = req.body.to;
      let betweenOrders = await Controller.betweenOrders(from, to, req.session.vendorId)
      let vendors = await Controller.getVendors();
      const vendorId = req.session.vendorId;
      res.render('order-list', { betweenOrders, vendors, vendorId, from, to })
    } catch(err){
      res.redirect('/viewProducts')
    console.error(err)
    }
  })

  Router.get('/between/:orderid', async(req, res, next) => {
    try{
      let getTotals = await Controller.getTotalBoxesPrice(req.params.orderid)
      let itemsDates = await Controller.between(req.params.orderid)
      res.render('order-detail', { itemsDates, getTotals })
    } catch(err){
      res.redirect('/viewProducts')
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