/* This is for MsSQL*/
CREATE TABLE products (
productId BIGINT IDENTITY (1,1) PRIMARY KEY,
description VARCHAR(255) NULL,
perCase VARCHAR (255) NULL,
price DECIMAL(10,2) NULL,
vendorId BIGINT FOREIGN KEY REFERENCES vendors(vendorId)
);

CREATE TABLE users (
  userId BIGINT IDENTITY (1,1) PRIMARY KEY,
  username VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  building VARCHAR(10) NULL,
  token VARCHAR (MAX) NULL
);

CREATE TABLE vendors(
  vendorId BIGINT IDENTITY (1,1) PRIMARY KEY,
  username VARCHAR (255) NULL,
  companyname VARCHAR (255) NULL,
  email VARCHAR (255) NULL,
  phone VARCHAR (255) NULL,
  token VARCHAR (MAX) NULL
);

CREATE TABLE orders(
  orderId BIGINT IDENTITY (1,1) PRIMARY KEY,
  date DATE NULL,
  vendorid BIGINT FOREIGN KEY REFERENCES vendors(vendorId),
  token VARCHAR (MAX) NULL
);

CREATE TABLE orderitems(
  orderitemsId BIGINT IDENTITY (1,1) PRIMARY KEY,
  amount VARCHAR (255) NULL,
  productdesc VARCHAR (255) NULL,
  qty VARCHAR (255) NULL,
  price DECIMAL (10,2) NULL,
  totalboxes VARCHAR(255) NULL,
  totalprice DECIMAL (10,2) NULL,
  date DATE NULL,
  orderId BIGINT FOREIGN KEY REFERENCES orders(orderId),
  vendorId BIGINT FOREIGN KEY REFERENCES vendors(vendorId),
  productId BIGINT FOREIGN KEY REFERENCES products(productId)
);

/* This is for MySQL*/
CREATE TABLE users (
  userId BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NULL,
  username VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  building VARCHAR(10) NULL,
  token TEXT NULL,
  PRIMARY KEY (userId)
);

CREATE TABLE products (
  productId BIGINT NOT NULL AUTO_INCREMENT,
  description VARCHAR(255),
  price VARCHAR (255) NULL,
  userId BIGINT,
  FOREIGN KEY(userId) REFERENCES users(userId),
  PRIMARY KEY (productId)
);

