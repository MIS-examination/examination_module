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

/* ----------EDIT EXAM PAGE--------------- */

router.get('/:_id?', checkLogin, function (req, res, next) {
  var exam_id = req.query.exam_id;
  var loginUser = localStorage.getItem('loginUser');
  var userType = localStorage.getItem('userType');
  if (userType == 'S') {
    console.log(exam_id);
    res.redirect('/dashboard', { exam_id : exam_id });
  }
  else {
    var _id = req.params._id;
    Exam.findOne({ _id: _id }).then((data) => {
      var examDetails = data;
      res.render('edit_exam', {
        u_name: loginUser,
        currentDate: moment().format("dddd[,] ll"),
        currentTime: moment().format(' h:mm A'),
        examDetails: examDetails,
        exam_id: exam_id
      });
    }, (err) => {
      console.log(err);
    });
  }

});

router.post('/:_id?',checkLogin ,function (req, res, next) {
  var _id =  req.params._id;
  var updatedDate = new Date(req.body.exam_date);
  
  Exam.findOneAndUpdate({ 'subjects._id': _id }, { $set: { 'subjects.$.exam_date': updatedDate } }, { new: true })
  .then((result, err) => {
    if (err) {
      console.log(err);
      res.json(err);
    }
    else {
      console.log("Date updated successfully ");
      res.redirect('/admin_dashboard');
    }
  });
  

});

module.exports = router;