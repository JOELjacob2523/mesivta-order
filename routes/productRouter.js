const Router = require("express").Router();
const { consumers } = require("nodemailer/lib/xoauth2");
const Controller = require("../controllers/products");
const multer = require("multer");
const XLSX = require("xlsx");

Router.get("/signup", (req, res, next) => {
  res.render("signup");
});

//router to singup
Router.post("/signup", async (req, res, next) => {
  try {
    await Controller.createUser(
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.building
    );
    res.redirect("/login");
  } catch (error) {
    console.error("Error inserting user credentials:", error);
    //res.redirect('wrong-signup-msg')
  }
});

// router to login
Router.get("/login", (req, res, next) => {
  res.render("login");
});

Router.post("/login", async (req, res, next) => {
  try {
    const { user, userId } = await Controller.confirmUser(
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.building
    );
    req.session.token = user.token;
    req.session.userId = userId;
    res.redirect("/order");
  } catch (error) {
    console.error("Error inserting user credentials:", error);
    setTimeout(() => {
      res.redirect("/login");
    }, 2000);
  }
});

// router to chooses vendor
Router.get("/order", async (req, res, next) => {
  try {
    let users = await Controller.getAllUsers(req.session.userId);
    let vendors = await Controller.getVendors();
    res.render("order", { users, vendors });
  } catch (err) {
    res.redirect("/login");
    console.error(err);
  }
});

// router to create new vendor
Router.post("/createVendor", async (req, res, next) => {
  try {
    await Controller.createVandor(
      req.body.vendorname,
      req.body.companyname,
      req.body.vendoremail,
      req.body.phone
    );
    res.redirect("/order");
  } catch (err) {
    console.error(err);
  }
});

// router to update vendor for token
Router.post("/updateVendor", async (req, res, next) => {
  try {
    let id = req.body.vendors;
    const { vendorId } = await Controller.updateVendor(
      req.session.vendorname,
      id,
      req.session.vendoremail
    );
    req.session.vendorId = vendorId;
    res.redirect("/viewProducts");
  } catch (err) {
    setTimeout(() => {
      res.redirect("/order");
    }, 2000);
    console.error(err);
  }
});

// router to return to main page
Router.get("/main", (req, res, next) => {
  res.redirect("/order");
});

// multer to upload files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toDateString() + "_" + file.originalname);
  },
});

const uploadFiles = multer({ storage });

let excelData;

// router to upload product file
Router.post("/uploads", uploadFiles.single("items"), (req, res, next) => {
  const excelFilePath = req.file.path;

  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  res.send(excelData);
});

// router to main page (view products file)
Router.get("/viewProducts", async (req, res, next) => {
  const vendorId = req.session.vendorId;
  const products = await Controller.getAll(vendorId);
  const vendors = await Controller.getVendors();
  res.render("view-products", {
    products,
    vendors,
    vendorId,
    excelData: excelData || "",
  });
});

// router to create new product
Router.post("/createProduct", async (req, res, next) => {
  try {
    const product = {
      description: req.body.description,
      perCase: req.body.perCase,
      price: req.body.price,
      vendorId: req.session.vendorId,
    };
    await Controller.createProduct(product);
    res.redirect("/viewProducts");
  } catch (err) {
    console.error(err);
  }
});

// router to insert uploaded product list in database
Router.post("/createProductList", async (req, res, next) => {
  try {
    const product = {
      description: req.body.description,
      perCase: req.body.perCase,
      price: req.body.price,
      vendorId: req.session.vendorId,
    };

    const { description, perCase, price, vendorId } = product;

    const productItems = [];

    const numProducts = description.length;

    for (let i = 0; i < numProducts; i++) {
      const productItem = {
        description: description[i],
        perCase: perCase[i],
        price: price[i],
        vendorId: vendorId,
      };

      productItems.push(productItem);
    }
    for (const productItem of productItems) {
      productItem.price = parseFloat(productItem.price);

      await Controller.createProduct(productItem);
    }
    setTimeout(() => {
      res.redirect("/viewProducts");
    }, 5000);
  } catch (err) {
    console.error(err);
  }
});

// router to insert order list in database
Router.post("/orderItems", async (req, res, next) => {
  try {
    const date = new Date();
    const year = date.toLocaleString("en-US", { year: "numeric" });
    const month = date.toLocaleString("en-US", { month: "2-digit" });
    const day = date.toLocaleString("en-US", { day: "2-digit" });
    const hour = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let time = `${month}/${day}/${year} ${hour}`;

    await Controller.orders(time, req.session.vendorId);
    const orderid = await Controller.insertOrderId(req.session.vendorId);

    const products = {
      amount: req.body.amount,
      productdesc: req.body.productdesc,
      qty: req.body.qty,
      price: req.body.price,
      totalboxes: req.body.totalboxes,
      totalprice: req.body.totalprice,
      date: time,
      orderId: orderid,
      vendorId: req.session.vendorId,
      totalrowprice: req.body.totalrowprice,
    };

    const {
      amount,
      productdesc,
      qty,
      price,
      totalrowprice,
      orderId,
      vendorId,
    } = products;

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
        vendorId: vendorId,
        totalrowprice: totalrowprice[i],
      };

      productItems.push(productItem);
    }

    for (const productItem of productItems) {
      productItem.orderId = orderid;
      productItem.qty = parseFloat(productItem.qty);
      productItem.price = parseFloat(productItem.price);

      await Controller.orderDetails(productItem);
      await Controller.orderTotal(
        orderid,
        products.totalboxes,
        products.totalprice
      );
    }
    await Controller.emailOrder(
      req.session.vendorId,
      req.session.userId,
      orderid,
      req.body.email_msg
    );
    setTimeout(() => {
      res.redirect("/viewProducts");
    }, 5000);
  } catch (err) {
    res.redirect("/login");
    console.error(err);
  }
});

// router to edit product
Router.get("/edit/:productId", async (req, res, next) => {
  const products = await Controller.getId(req.params.productId);
  res.render("update", { products });
});

// router to update the product
Router.post("/update", async (req, res, next) => {
  try {
    await Controller.updateProduct(req.body);
    setTimeout(() => {
      res.redirect("/viewProducts");
    }, 5000);
  } catch (err) {
    console.error(err);
  }
});

// router to delete a product
Router.post("/delete", async (req, res, next) => {
  try {
    await Controller.deleteProduct(req.body.productId);
    setTimeout(() => {
      res.redirect("/viewProducts");
    }, 5000);
  } catch (err) {
    console.error(err);
  }
});

// router to search orders between 2 dates
Router.post("/betweenOrders", async (req, res, next) => {
  try {
    let from = req.body.from;
    let to = req.body.to;
    let betweenOrders = await Controller.betweenOrders(
      from,
      to,
      req.session.vendorId
    );
    let vendors = await Controller.getVendors();
    const vendorId = req.session.vendorId;
    let products = await Controller.getAll(vendorId);
    res.render("order-list", {
      betweenOrders,
      vendors,
      vendorId,
      from,
      to,
      products,
    });
  } catch (err) {
    res.redirect("/viewProducts");
    console.error(err);
  }
});

// router to search item between 2 dates
Router.post("/between_item", async (req, res, next) => {
  try {
    const vendorId = req.session.vendorId;
    let from = req.body.from;
    let to = req.body.to;
    let betweenItems = await Controller.getTotalItemOrdered(
      vendorId,
      from,
      to,
      req.body.products
    );
    let vendors = await Controller.getVendors();
    let products = await Controller.getAll(vendorId);
    res.render("item-list", {
      betweenItems,
      vendors,
      vendorId,
      from,
      to,
      products,
    });
  } catch (err) {
    res.redirect("/viewProducts");
    console.error(err);
  }
});

Router.get("/between/:orderid", async (req, res, next) => {
  try {
    let getTotals = await Controller.getTotalBoxesPrice(req.params.orderid);
    let itemsDates = await Controller.between(req.params.orderid);
    res.render("order-detail", { itemsDates, getTotals });
  } catch (err) {
    res.redirect("/viewProducts");
    console.error(err);
  }
});

// router to logout
Router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(400).send("Unable to logout");
    } else {
      res.redirect("/login");
    }
  });
});

module.exports = Router;
