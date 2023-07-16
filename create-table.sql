/* This is for MsSQL*/
CREATE TABLE List (
listId BIGINT IDENTITY (1,1) PRIMARY KEY,
subject VARCHAR(255),
description VARCHAR(255),
date DATE,
time TIME,
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

CREATE TABLE List (
  listId BIGINT NOT NULL AUTO_INCREMENT,
  subject VARCHAR(255),
  description VARCHAR(255),
  date DATE NULL,
  time TIME NULL,
  userId BIGINT,
  FOREIGN KEY(userId) REFERENCES users(userId),
  PRIMARY KEY (listId)
);

