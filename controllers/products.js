const { knex } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");


module.exports = {
    createUser,
    confirmUser,
    getAllUsers,
    createProduct
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
      name: username,
      email: email,
      password: hashedPassword,
      building: building,
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

  async function createProduct(product){
    return await knex("products").insert(product);
  }