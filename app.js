const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = require('./routes')

const app = express();

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// session configuration
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'somesecret', 
    cookie: { maxAge: 60000 }})
);

// config route
app.all("*", router);

module.exports = app;