DROP DATABASE IF EXISTS jobly;

CREATE DATABASE jobly;

\c jobly


CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL ,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT

);



CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL ,
  salary DECIMAL,
  equity  DECIMAL NOT NULL  check(equity < 1),
  company_handle TEXT REFERENCES companies(handle) ON UPDATE CASCADE ON DELETE CASCADE,
  date_posted DATE DEFAULT now()

);


CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email  TEXT NOT NULL,
  photo_url TEXT,
  is_admin BOOLEAN NOT NULL

);
