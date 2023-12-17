const { knex } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");


module.exports = {
    createUser,
    confirmUser,
    getAllUsers,
    createProduct,
    createVandor,
    updateVendor,
    getVendors,
    getAll,
    orders,
    orderDetails,
    getId,
    updateProduct,
    between,
    insertOrderId,
    deleteProduct,
    betweenOrders,
    orderTotal,
    getTotalBoxesPrice
}


// get config vars
dotenv.config();
// access config var
process.env.TOKEN_KEY;
async function createUser(username, email, password, building) {
  const user = await knex("users").where("email", email).first();
  if (user) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const payload = {
    username: username,
    email: email,
    password: hashedPassword,
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY);
  await knex("users").insert({ username, email, password: hashedPassword, building, token });
}

async function confirmUser(username, email, password, building) {
    const user = await knex("users").where("email", email).first();
    if (!user) {
      throw new Error("Invalid username or password");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid username or password");
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const id = user.userId;
    const payload = {
      userId: id,
      username: username,
      email: email,
      password: hashedPassword,
      building: building,
      role: 'user'
    };
    const token = jwt.sign(payload, process.env.TOKEN_KEY);
    await knex("users").where("userId", id).update({ token });
    
    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    const userId = decodedToken.userId;
    
    return { user, userId };
  }

  async function getAllUsers(id){
    return await knex("users").select().where({userId: id});
  }

  async function createVandor(vendorname, companyname, vendoremail, phone){
    const payload = {
      vendorname: vendorname,
      companyname: companyname,
      vendoremail: vendoremail,
    }
    const token = jwt.sign(payload, process.env.TOKEN_KEY);
    return await knex("vendors").insert({vendorname, companyname, vendoremail, phone, token});
  }

  async function updateVendor(vendorname, companyname, vendoremail){    
    const vendor = await knex("vendors").where({companyname: companyname}).first();
    if (!vendor) {
      throw new Error("Invalid username or password");
    }    
    const id = vendor.vendorId;

    const payload = {
      vendorId: id,
      vendorname: vendorname,
      companyname: companyname,
      vendoremail: vendoremail,
      role: 'vendor'
    }
    const token = jwt.sign(payload, process.env.TOKEN_KEY);
    await knex("vendors").where("vendorId", id).update({ token });

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    const decodedVendorId = decodedToken.vendorId;

    return { vendor, vendorId: decodedVendorId };
  }

  async function createProduct(product){
    return await knex("products").insert(product);
  }

  async function deleteProduct(id) {
    return knex("products").where("productId", id).del();
  }

  async function getVendors() {
    return await knex("vendors").select();
  }

  async function getAll(vendorId){
    return await knex("products").select().where({vendorId: vendorId});
  }

  async function orders(date, vendorId){
    const vendor = await knex("vendors").where({vendorId: vendorId}).first();

    const id = vendor.vendorId;
    const payload = {
      vendorId: id,
    }
    const token = jwt.sign(payload, process.env.TOKEN_KEY);
    await knex("orders").insert({date, vendorid: vendorId, token});
  }

  async function insertOrderId(vendorId){
    const order = await knex("orders").where({vendorId: vendorId});
    const orderid = order[order.length - 1].orderId;

    const payload = {
      vendorId: vendorId,
      orderId: orderid
    }
    const token = jwt.sign(payload, process.env.TOKEN_KEY);
    await knex("orders").where("orderId", orderid).update({ token });
    return orderid
  }

  async function orderDetails (products) {
    await knex("orderitems").insert(products);
  }

  async function orderTotal (orderid, totalboxes, totalprice){
    await knex('orders').where({orderId: orderid}).update({ totalboxes, totalprice});
  }

  async function getId(productId){
    return await knex("products").select().where({productId: productId});
  }

  async function updateProduct(product) {
    const { productId, description, perCase, price } = product;
    return knex("products").where({productId: productId}).update({ description, perCase, price });
  }

  async function between(orderId) {
    return knex.select('amount', 'productdesc', 'qty', 'price', 'totalboxes', 'totalprice', 'date')
    .from('orderitems').where({orderId: orderId});
    };

    async function betweenOrders(from, to, vendorId){
      return knex.select().from('orders').whereBetween('date', [from, to]).where({vendorId: vendorId})
    }

    async function getTotalBoxesPrice(orderid){
      return knex.select('totalboxes', 'totalprice').from('orders').where({orderId: orderid})
    }