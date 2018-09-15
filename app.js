var express = require('express');
var path = require('path');
var cors = require('cors');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
// var users = require('./routes/users');
var fs = require('fs')

var app = express();
const router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var login_register = require('./routes/login_register');
var quest = require('./routes/quest');
// var older_quest = require('./routes/older_quest');

var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.second = new schedule.Range(0, 59, 2);

var coin = parseFloat(fs.readFileSync('./coin', 'utf-8'));
console.log(coin);
var j = schedule.scheduleJob(rule, function(){
  console.log(coin);
  if(coin <= 19){
    coin += Math.random() * 10;
  }else{
    var check = Math.random() - 0.5;
    coin += check * 10;
  }
  fs.writeFile('./coin', coin, 'utf-8', e => {
    if(e){
      console.log(e);
    }else{
      console.log('시세 :', coin);
    }
  })
});




app.use('/api/v1g1/user', login_register);
app.use('/api/v1g1/room',quest);
// app.use('/api/v1g1/senior',older_quest);
app.use('/', index);
// app.use('/users', users);
app.use('/apidoc', express.static('apidoc'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
