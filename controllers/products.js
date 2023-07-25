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
    getAll
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

  async function getVendors() {
    return await knex("vendors").select();
  }

  async function getAll(){
    return await knex("products").select();
  }