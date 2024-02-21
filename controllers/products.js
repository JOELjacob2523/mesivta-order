const { knex } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const CONFIG = require("../config.json");
const ejs = require("ejs");

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
  getTotalBoxesPrice,
  emailOrder,
  getTotalItemOrdered,
};

// get config vars
dotenv.config();
// access config var
process.env.TOKEN_KEY;

// create user
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
  await knex("users").insert({
    username,
    email,
    password: hashedPassword,
    building,
    token,
  });
}

// confirm user
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
    role: "user",
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY);
  await knex("users").where("userId", id).update({ token });

  const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
  const userId = decodedToken.userId;

  return { user, userId };
}

// get all users
async function getAllUsers(id) {
  return await knex("users").select().where({ userId: id });
}

// create new vendor
async function createVandor(vendorname, companyname, vendoremail, phone) {
  const payload = {
    vendorname: vendorname,
    companyname: companyname,
    vendoremail: vendoremail,
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY);
  return await knex("vendors").insert({
    vendorname,
    companyname,
    vendoremail,
    phone,
    token,
  });
}

// update vendor for token
async function updateVendor(vendorname, companyname, vendoremail) {
  const vendor = await knex("vendors")
    .where({ companyname: companyname })
    .first();
  if (!vendor) {
    throw new Error("Please choose a valid vendor");
  }
  const id = vendor.vendorId;

  const payload = {
    vendorId: id,
    vendorname: vendorname,
    companyname: companyname,
    vendoremail: vendoremail,
    role: "vendor",
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY);
  await knex("vendors").where("vendorId", id).update({ token });

  const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
  const decodedVendorId = decodedToken.vendorId;

  return { vendor, vendorId: decodedVendorId };
}

//create new product
async function createProduct(product) {
  return await knex("products").insert(product);
}

// delete item
async function deleteProduct(id) {
  return knex("products").where("productId", id).del();
}

// get all vendors
async function getVendors() {
  return await knex("vendors").select();
}

// get all products
async function getAll(vendorId) {
  return await knex("products").select().where({ vendorId: vendorId });
}

// insert order information
async function orders(date, vendorId) {
  const vendor = await knex("vendors").where({ vendorId: vendorId }).first();

  const id = vendor.vendorId;
  const payload = {
    vendorId: id,
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY);
  await knex("orders").insert({ date, vendorid: vendorId, token });
}

// insert order ID
async function insertOrderId(vendorId) {
  const order = await knex("orders").where({ vendorId: vendorId });
  const orderid = order[order.length - 1].orderId;

  const payload = {
    vendorId: vendorId,
    orderId: orderid,
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY);
  await knex("orders").where("orderId", orderid).update({ token });
  return orderid;
}

// insert order list
async function orderDetails(products) {
  await knex("orderitems").insert(products);
}

// insert order total price & boxes
async function orderTotal(orderid, totalboxes, totalprice) {
  await knex("orders")
    .where({ orderId: orderid })
    .update({ totalboxes, totalprice });
}

// get product ID
async function getId(productId) {
  return await knex("products").select().where({ productId: productId });
}

// update product
async function updateProduct(product) {
  const { productId, description, perCase, price } = product;
  return knex("products")
    .where({ productId: productId })
    .update({ description, perCase, price });
}

async function between(orderId) {
  return knex
    .select("amount", "productdesc", "qty", "price", "date", "totalrowprice")
    .from("orderitems")
    .where({ orderId: orderId });
}

// select items between dates
async function betweenOrders(from, to, vendorId) {
  return knex
    .select()
    .from("orders")
    .whereBetween("date", [from, to])
    .where({ vendorId: vendorId });
}

// get total price & boxes
async function getTotalBoxesPrice(orderid) {
  return knex
    .select("totalboxes", "totalprice")
    .from("orders")
    .where({ orderId: orderid });
}

// get total orders
async function getTotalItemOrdered(vendorId, from, to, productdesc) {
  return knex("orderitems")
    .select()
    .where({ productdesc: productdesc })
    .whereBetween("date", [from, to])
    .where({ vendorId: vendorId });
}

// email order
async function emailOrder(vendorId, userId, orderId, msg) {
  try {
    let vendorEmail = await knex("vendors")
      .select()
      .where({ vendorId: vendorId })
      .first();
    let vendors = await knex("vendors").select();
    let orders = await knex
      .select()
      .from("orderitems")
      .where({ vendorId: vendorId, orderId: orderId });
    let totalOrders = await knex
      .select()
      .from("orders")
      .where({ vendorId: vendorId, orderId: orderId });
    let users = await knex.select().from("users").where({ userId: userId });

    const date = new Date();
    const year = date.toLocaleString("en-US", { year: "numeric" });
    const month = date.toLocaleString("en-US", { month: "2-digit" });
    const day = date.toLocaleString("en-US", { day: "2-digit" });
    let time = `${month}/${day}/${year}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "utamky6@gmail.com",
        pass: CONFIG.EMAIL_PASS,
      },
    });
    ejs.renderFile(
      "views/email.ejs",
      { vendors, vendorId, orders, totalOrders, users, orderId, msg },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          const mailOptions = {
            from: "utamky6@gmail.com",
            to: vendorEmail.vendoremail,
            subject: `Order from Mesivta KJ ${time}`,
            text: msg,
            html: data,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
}
