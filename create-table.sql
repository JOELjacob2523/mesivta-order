/* This is for MsSQL*/
CREATE TABLE products (
productId BIGINT IDENTITY (1,1) PRIMARY KEY,
description VARCHAR(255) NULL,
price VARCHAR(255) NULL,
userId BIGINT FOREIGN KEY REFERENCES users(userId)
);

CREATE TABLE users (
  userId BIGINT IDENTITY (1,1) PRIMARY KEY,
  name VARCHAR(255) NULL,
  username VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  building VARCHAR(10) NULL,
  token VARCHAR (MAX) NULL
);

CREATE TABLE vendors(
  vendorId BIGINT IDENTITY (1,1) PRIMARY KEY,
  vendorName VARCHAR (255) NULL,
  vendorEmail VARCHAR (255) NULL,
)

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

