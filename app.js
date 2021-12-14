var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

///
var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var admin_dashboardRouter = require('./routes/admin_dashboard');
var edit_examRouter = require('./routes/edit_exam');
var uploadmarksRouter = require('./routes/upload_marks');

var app = express();
///
var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');// users/:Id/:pass

var app = express();
app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'KJBUBihubub871374rq^&@&@',
  resave: false,
  saveUninitialized: true
}));

app.use('/', indexRouter);
// app.use('/dashboard', dashboardRouter);
// app.use('/admin_dashboard', admin_dashboardRouter);
// app.use('/admin_dashboard/edit_exam/:_id?', edit_examRouter);
// app.use('/uploadmarks', uploadmarksRouter);

//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
