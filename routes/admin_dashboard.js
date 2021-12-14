var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

var Teacher = require('../modules/teacher');
var McaStudent = require('../modules/mca_student');
var Exam = require('../modules/subject');

var router = express.Router();


/* ----------MEMORY ALLOCATION FOR TOKEN--------------- */
if(typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage; 
  localStorage = new LocalStorage('./scratch');
}


/* -------MIDDLEWARE TO VALIDATE USER----------*/

function checkLogin(req,res,next){
  var userToken = localStorage.getItem('userToken');
  try{
    var decode = jwt.verify(userToken, 'loginToken');
   // return next();
  } catch(err){
    //return 
    res.redirect('/');
  }
  next();
}

/* ----------TEACHER DASHBOARD PAGE--------------- */
router.get('/', checkLogin, function(req, res, next) {
  
  var u_name = localStorage.getItem('loginUser');
  var userType = localStorage.getItem('userType');
  if (userType == 'S') {
    res.redirect('/dashboard');
  } else {
    var mySort = { semester: 1 };

    Exam.find({}, null, { sort: mySort }).then((data) => {
      //var allExamDetails = data;
      res.render('admin_dashboard', {
        u_name: u_name,
        currentDate: moment().format("dddd[,] ll"),
        currentTime: moment().format(' h:mm A'),
        allExamDetails: data,
        msg:''
      });
    }, (err) => {
      console.log(err);
    });
  }
});

module.exports = router;