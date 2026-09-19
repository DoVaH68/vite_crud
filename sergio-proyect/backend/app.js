var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var routeClientes = require('./routes/clientes');
var routeProductos = require('./routes/productos');
var routeVentas = require('./routes/ventas');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/clientes', routeClientes);
app.use('/productos', routeProductos);
app.use('/ventas', routeVentas);
app.use('/', indexRouter);

// --- Sirve el frontend ya compilado ---
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use(function(req, res, next) {
  if (req.method === 'GET' && !req.path.startsWith('/users') && !req.path.startsWith('/clientes') && !req.path.startsWith('/productos') && !req.path.startsWith('/ventas')) {
    return res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
  next();
});
// --- fin ---

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ mensaje: err.message });
});

module.exports = app;