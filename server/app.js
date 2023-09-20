const express = require("express");
const fileupload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require('body-parser');
 
const app = express();
const path = require('path'); 
app.use(cors());
app.use(fileupload());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
const userRoute = require('./route/users');
const booksRoute = require('./route/books');
const categoryRoute = require('./route/category');
const publicerRoute = require('./route/publicer');
const interestedRoute = require('./route/interested');
const cartRoute = require('./route/cart');
const addressRoute = require('./route/address');
const purchaseOrderRoute = require('./route/purchaseOrder');
const paymentRoute = require('./route/payment');
const uploadRoute = require('./route/upload');
const reportRoute = require('./route/report');

app.use('/users',userRoute);
app.use('/books',booksRoute);
app.use('/category',categoryRoute);
app.use('/publicer',publicerRoute);
app.use('/interested',interestedRoute);
app.use('/cart',cartRoute);
app.use('/address',addressRoute);
app.use('/purchase_order',purchaseOrderRoute);
app.use('/payment',paymentRoute);
app.use('/upload',uploadRoute);
app.use('/report',reportRoute);

module.exports = app;