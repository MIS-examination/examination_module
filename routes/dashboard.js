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
/* ------------------STUDENT DASHBOARD---------------------- */
router.get('/', checkLogin, function(req, res, next) {
  
  var u_name = localStorage.getItem('loginUser');
  var userSem = localStorage.getItem('userSem');
  var userType = localStorage.getItem('userType');
  if (userType == 'T') {
    res.redirect('/admin_dashboard');
  } else {

    Exam.findOne({ semester: userSem }).then((data) => {
      var examDetails = data.subjects;
      var sortedExamDetails = examDetails.sort(function (a, b) {
        return a.exam_date - b.exam_date;
      });
      res.render('dashboard', {
        u_name: u_name, currentDate: moment().format("dddd[,] ll"),
        currentTime: moment().format(' h:mm A'),
        examDetails: sortedExamDetails
      });

    }, (err) => {
      console.log(err);
    });
  }
});

module.exports = router;