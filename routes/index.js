var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');


var Teacher = require('../modules/teacher');
var McaStudent = require('../modules/mca_student');
var Exam = require('../modules/subject');
var marksModel = require('../modules/testMarks');
var marks =  marksModel.firstMarksModel;

var jwt = require('jsonwebtoken');
const app = require('../app');
const session = require('express-session');


/* ----------MEMORY ALLOCATION FOR TOKEN--------------- */
if(typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage; 
  localStorage = new LocalStorage('./scratch');
}

var router = express.Router();


/* to encrypt use module bcrypt */

/*----------MIDDLEWARE TO CREATE USER TOKEN----------*/
function checkUser(req,res,next){
  var username=req.body.uname;
  var password=req.body.password;

  if(username.includes("PGCACA")){
    var checkUser= McaStudent.findOne({id:username, password:password});
    checkUser.exec((err, data)=>{
      if (data == null) {
       
        return res.render('login', {
          msg: "Invalid Username or Password.",
          currentDate: moment().format('dddd[,] ll'),
          currentTime: moment().format(' h:mm A')
      
       });
  
     }else{
  
        if(err) throw err;
        var getUserID=data._id;
        var getUser = data.first_name + " " + data.last_name;
        var getUserSem = data.semester;
        req.session.user = getUserID;
        var token = jwt.sign({ userID: getUserID }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', getUser);
        localStorage.setItem('userType','S' );
        localStorage.setItem('userSem', getUserSem);
        return res.redirect('./dashboard');
        
      }
    });
  }
  else {
      var checkUser= Teacher.findOne({id:username, password:password});
      checkUser.exec((err, data)=>{
        if(data==null){
          return res.render('login', {
            msg: "Invalid Username or Password.",
            currentDate: moment().format("dddd[,] ll"),
            currentTime: moment().format(' h:mm A')
          });
  
        }else{
  
          if(err) throw err;
          var getUserID=data._id;
          var getUser = data.first_name + " " + data.last_name;
          req.session.user = getUserID;
          var token = jwt.sign({ userID: getUserID }, 'loginToken');
          localStorage.setItem('userToken', token);
          localStorage.setItem('loginUser', getUser);
          localStorage.setItem('userType', 'T');
          return res.redirect('/admin_dashboard');
          
        }
      });
  }
 next();
}

/* -------MIDDLEWARE TO VALIDATE USER----------*/
function checkLogin(req,res,next){
  var userToken = localStorage.getItem('userToken');
  try {
    if(req.session.user){
      jwt.verify(userToken, 'loginToken');
    }
    else {
      res.redirect('/');
    }
  } catch(err){
    //return 
    res.redirect('/');
  }
  next();
}



/*----------LOGIN PAGE---------------*/

router.get('/', function(req, res, next) {
  //var loginUser = localStorage.getItem('loginUser');
  var loginUser = req.session.user;
  if (loginUser) {

    var userType = localStorage.getItem('userType');
    if (userType == 'S') {
      res.redirect('./dashboard');
    } else if (userType == 'T') {
      res.redirect('./admin_dashboard');
    }

  }else{
    res.render('login', {
      msg: '',
      currentDate: moment().format("dddd[,] ll"),
      currentTime: moment().format(' h:mm A')
    });
  }
});

router.post('/', checkUser, function (req, res, next) { });


/* ----------STUDENT DASHBOARD PAGE--------------- */
router.get('/dashboard', checkLogin, function(req, res, next) {
  
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

/* ----------TEACHER DASHBOARD PAGE--------------- */

router.get('/admin_dashboard', checkLogin, function(req, res, next) {
  
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

// /* ----------EDIT EXAM PAGE--------------- */

router.get('/admin_dashboard/edit_exam/:_id?', checkLogin, function (req, res, next) {
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

router.post('/admin_dashboard/edit_exam/:_id?',checkLogin ,function (req, res, next) {
  var _id =  req.params._id;
  var updatedDate = new Date(req.body.exam_date);
  
  Exam.findOneAndUpdate({ 'subjects._id': _id },{ $set: { 'subjects.$.exam_date': updatedDate } }, { new: true })
  .then((result, err) => {
    if (err) {
      res.redirect('/admin_dashboard');
      console.log(err);
      
    }
    else {
      console.log("Date updated successfully ");
      res.redirect('/admin_dashboard');
    }
  });
  

});
/* -------<<<<<<<---BIPUL--->>>>>>------------ */
/* ----------UPLOAD MARKS / RESULT PROCESS--------------- */

router.get('/result_process',checkLogin ,(req, res) => {
  var loginUser = localStorage.getItem('loginUser');
  res.render('uploadmarks', {
    success: '',
    u_name: loginUser,
    currentDate: moment().format("dddd[,] ll"),
    currentTime: moment().format(' h:mm A')
  });
});


router.post('/result_process',checkLogin ,(req, res) => {
    
    var chk = marksModel.firstMarksModel.find({ sem: req.body.sem, regd: req.body.regd });
    chk.exec(async function (err1, res1) {
        if (err1) throw err1;
        if (res1 == '') {
            console.log(req.body.sem);
            if (req.body.sem == 'I') {
                console.log('First')
                
                var marksOne = new marksModel.firstMarksModel({
                    'regd': req.body.regd,
                    'sem': req.body.sem,
                    'CA3101': {
                        'mid': req.body.CA3101mid,
                        'test': req.body.CA3101test,
                        'assignment': req.body.CA3101assignment,
                        'end': req.body.CA3101end,
                        'total': parseInt(req.body.CA3101mid) + parseInt(req.body.CA3101test) + parseInt(req.body.CA3101assignment) + parseInt(req.body.CA3101end)
                    },
                    'CA3102': {
                        'mid': req.body.CA3102mid,
                        'test': req.body.CA3102test,
                        'assignment': req.body.CA3102assignment,
                        'end': req.body.CA3102end,
                        'total': parseInt(req.body.CA3102mid) + parseInt(req.body.CA3102test) + parseInt(req.body.CA3102assignment) + parseInt(req.body.CA3102end)
                    },
                    'CA3103': {
                        'mid': req.body.CA3103mid,
                        'test': req.body.CA3103test,
                        'assignment': req.body.CA3103assignment,
                        'end': req.body.CA3103end,
                        'total': parseInt(req.body.CA3103mid) + parseInt(req.body.CA3103test) + parseInt(req.body.CA3103assignment) + parseInt(req.body.CA3103end)
                    },
                    'CA3104': {
                        'mid': req.body.CA3104mid,
                        'test': req.body.CA3104test,
                        'assignment': req.body.CA3104assignment,
                        'end': req.body.CA3104end,
                        'total': parseInt(req.body.CA3104mid) + parseInt(req.body.CA3104test) + parseInt(req.body.CA3104assignment) + parseInt(req.body.CA3104end)
                    },
                    'CA3105': {
                        'mid': req.body.CA3105mid,
                        'test': req.body.CA3105test,
                        'assignment': req.body.CA3105assignment,
                        'end': req.body.CA3105end,
                        'total': parseInt(req.body.CA3105mid) + parseInt(req.body.CA3105test) + parseInt(req.body.CA3105assignment) + parseInt(req.body.CA3105end)
                    },
                    'MA3101': {
                        'mid': req.body.MA3101mid,
                        'test': req.body.MA3101test,
                        'assignment': req.body.MA3101assignment,
                        'end': req.body.MA3101end,
                        'total': parseInt(req.body.MA3101mid) + parseInt(req.body.MA3101test) + parseInt(req.body.MA3101assignment) + parseInt(req.body.MA3101end)
                    },
                    'MA3102': {
                        'mid': req.body.MA3102mid,
                        'test': req.body.MA3102test,
                        'assignment': req.body.MA3102assignment,
                        'end': req.body.MA3102end,
                        'total': parseInt(req.body.MA3102mid) + parseInt(req.body.MA3102test) + parseInt(req.body.MA3102assignment) + parseInt(req.body.MA3102end)
                    }
                });

                marksOne.save(function (err, data) {
                    if (err) throw error;
                  res.render('uploadmarks', {
                    success: 'Record inserted successfully!',
                    u_name: loginUser,
                    currentDate: moment().format("dddd[,] ll"),
                    currentTime: moment().format(' h:mm A')
                  });
                    console.log(data);
                })
            }

            if (req.body.sem == 'II') {
                console.log('second');
                //var secondMarksModel = mongoose.model('Marks', marksSchema.secondSemSchema);
                var marksTwo = new marksModel.firstMarksModel({
                    'regd': req.body.regd,
                    'sem': req.body.sem,
                    'CA3201': {
                        'mid': req.body.CA3201mid,
                        'test': req.body.CA3201test,
                        'assignment': req.body.CA3201assignment,
                        'end': req.body.CA3201end,
                        'total': parseInt(req.body.CA3201mid) + parseInt(req.body.CA3201test) + parseInt(req.body.CA3201assignment) + parseInt(req.body.CA3201end)
                    },
                    'CA3202': {
                        'mid': req.body.CA3202mid,
                        'test': req.body.CA3202test,
                        'assignment': req.body.CA3202assignment,
                        'end': req.body.CA3202end,
                        'total': parseInt(req.body.CA3202mid) + parseInt(req.body.CA3202test) + parseInt(req.body.CA3202assignment) + parseInt(req.body.CA3202end)
                    },
                    'CA3203': {
                        'mid': req.body.CA3203mid,
                        'test': req.body.CA3203test,
                        'assignment': req.body.CA3203assignment,
                        'end': req.body.CA3203end,
                        'total': parseInt(req.body.CA3203mid) + parseInt(req.body.CA3203test) + parseInt(req.body.CA3203assignment) + parseInt(req.body.CA3203end)
                    },
                    'CA3204': {
                        'mid': req.body.CA3204mid,
                        'test': req.body.CA3204test,
                        'assignment': req.body.CA3204assignment,
                        'end': req.body.CA3204end,
                        'total': parseInt(req.body.CA3204mid) + parseInt(req.body.CA3204test) + parseInt(req.body.CA3204assignment) + parseInt(req.body.CA3204end)
                    },
                    'CA3205': {
                        'mid': req.body.CA3205mid,
                        'test': req.body.CA3205test,
                        'assignment': req.body.CA3205assignment,
                        'end': req.body.CA3205end,
                        'total': parseInt(req.body.CA3205mid) + parseInt(req.body.CA3205test) + parseInt(req.body.CA3205assignment) + parseInt(req.body.CA3205end)
                    },
                    'CA3206': {
                        'mid': req.body.CA3206mid,
                        'test': req.body.CA3206test,
                        'assignment': req.body.CA3206assignment,
                        'end': req.body.CA3206end,
                        'total': parseInt(req.body.CA3206mid) + parseInt(req.body.CA3206test) + parseInt(req.body.CA3206assignment) + parseInt(req.body.CA3206end)
                    },
                    'MA3201': {
                        'mid': req.body.MA3201mid,
                        'test': req.body.MA3201test,
                        'assignment': req.body.MA3201assignment,
                        'end': req.body.MA3201end,
                        'total': parseInt(req.body.MA3201mid) + parseInt(req.body.MA3201test) + parseInt(req.body.MA3201assignment) + parseInt(req.body.MA3201end)
                    }
                });

                marksTwo.save(function (err, data) {
                    if (err) throw error;
                  res.render('uploadmarks', {
                    success: 'Record inserted successfully!',
                    u_name: loginUser,
                    currentDate: moment().format("dddd[,] ll"),
                    currentTime: moment().format(' h:mm A')
                  });
                    console.log(data);
                })
            }

            if (req.body.sem == 'III') {
                console.log('third');
                //var thirdMarksModel = mongoose.model('Marks', marksSchema.thirdSemSchema);
                var marksThree = new marksModel.firstMarksModel({
                    'regd': req.body.regd,
                    'sem': req.body.sem,
                    'CA3301': {
                        'mid': req.body.CA3301mid,
                        'test': req.body.CA3301test,
                        'assignment': req.body.CA3301assignment,
                        'end': req.body.CA3301end,
                        'total': parseInt(req.body.CA3301mid) + parseInt(req.body.CA3301test) + parseInt(req.body.CA3301assignment) + parseInt(req.body.CA3301end)
                    },
                    'CA3302': {
                        'mid': req.body.CA3302mid,
                        'test': req.body.CA3302test,
                        'assignment': req.body.CA3302assignment,
                        'end': req.body.CA3302end,
                        'total': parseInt(req.body.CA3302mid) + parseInt(req.body.CA3302test) + parseInt(req.body.CA3302assignment) + parseInt(req.body.CA3302end)
                    },
                    'CA3303': {
                        'mid': req.body.CA3303mid,
                        'test': req.body.CA3303test,
                        'assignment': req.body.CA3203assignment,
                        'end': req.body.CA3203end,
                        'total': parseInt(req.body.CA3303mid) + parseInt(req.body.CA3303test) + parseInt(req.body.CA3203assignment) + parseInt(req.body.CA3203end)
                    },
                    'CA3304': {
                        'mid': req.body.CA3304mid,
                        'test': req.body.CA3304test,
                        'assignment': req.body.CA3304assignment,
                        'end': req.body.CA3304end,
                        'total': parseInt(req.body.CA3304mid) + parseInt(req.body.CA3304test) + parseInt(req.body.CA3304assignment) + parseInt(req.body.CA3304end)
                    },
                    'CA3305': {
                        'mid': req.body.CA3305mid,
                        'test': req.body.CA3305test,
                        'assignment': req.body.CA3305assignment,
                        'end': req.body.CA3305end,
                        'total': parseInt(req.body.CA3305mid) + parseInt(req.body.CA3305test) + parseInt(req.body.CA3305assignment) + parseInt(req.body.CA3305end)
                    },
                    'CA3306': {
                        'mid': req.body.CA3306mid,
                        'test': req.body.CA3306test,
                        'assignment': req.body.CA3306assignment,
                        'end': req.body.CA3306end,
                        'total': parseInt(req.body.CA3306mid) + parseInt(req.body.CA3306test) + parseInt(req.body.CA3306assignment) + parseInt(req.body.CA3306end)
                    },
                    'CA3307': {
                        'mid': req.body.CA3307mid,
                        'test': req.body.CA3307test,
                        'assignment': req.body.CA3307assignment,
                        'end': req.body.CA3307end,
                        'total': parseInt(req.body.CA3307mid) + parseInt(req.body.CA3307test) + parseInt(req.body.CA3307assignment) + parseInt(req.body.CA3307end)
                    }
                });

                marksThree.save(function (err, data) {
                    if (err) throw error;
                  res.render('uploadmarks', {
                    success: 'Record inserted successfully!',
                    u_name: loginUser,
                    currentDate: moment().format("dddd[,] ll"),
                    currentTime: moment().format(' h:mm A')
                  });
                    console.log(data);
                })
            }

            if (req.body.sem == 'IV') {
                console.log('fourth');
                var marksFour = new marksModel.firstMarksModel({
                    'regd': req.body.regd,
                    'sem': req.body.sem,
                    'CA3401': {
                        'mid': req.body.CA3401mid,
                        'test': req.body.CA3401test,
                        'assignment': req.body.CA3401assignment,
                        'end': req.body.CA3401end,
                        'total': parseInt(req.body.CA3401mid) + parseInt(req.body.CA3401test) + parseInt(req.body.CA3401assignment) + parseInt(req.body.CA3401end)
                    },
                    'CA3402': {
                        'mid': req.body.CA3402mid,
                        'test': req.body.CA3402test,
                        'assignment': req.body.CA3402assignment,
                        'end': req.body.CA3402end,
                        'total': parseInt(req.body.CA3402mid) + parseInt(req.body.CA3402test) + parseInt(req.body.CA3402assignment) + parseInt(req.body.CA3402end)
                    },
                    'CA3403': {
                        'mid': req.body.CA3403mid,
                        'test': req.body.CA3403test,
                        'assignment': req.body.CA3403assignment,
                        'end': req.body.CA3403end,
                        'total': parseInt(req.body.CA3403mid) + parseInt(req.body.CA3403test) + parseInt(req.body.CA3403assignment) + parseInt(req.body.CA3403end)
                    },
                    'CA3404': {
                        'mid': req.body.CA3404mid,
                        'test': req.body.CA3404test,
                        'assignment': req.body.CA3404assignment,
                        'end': req.body.CA3404end,
                        'total': parseInt(req.body.CA3404mid) + parseInt(req.body.CA3404test) + parseInt(req.body.CA3404assignment) + parseInt(req.body.CA3404end)
                    },
                    'CA3405': {
                        'mid': req.body.CA3405mid,
                        'test': req.body.CA3405test,
                        'assignment': req.body.CA3405assignment,
                        'end': req.body.CA3405end,
                        'total': parseInt(req.body.CA3405mid) + parseInt(req.body.CA3405test) + parseInt(req.body.CA3405assignment) + parseInt(req.body.CA3405end)
                    },
                    'CA3406': {
                        'mid': req.body.CA3406mid,
                        'test': req.body.CA3406test,
                        'assignment': req.body.CA3406assignment,
                        'end': req.body.CA3406end,
                        'total': parseInt(req.body.CA3406mid) + parseInt(req.body.CA3406test) + parseInt(req.body.CA3406assignment) + parseInt(req.body.CA3406end)
                    },
                    'CA3407': {
                        'mid': req.body.CA3407mid,
                        'test': req.body.CA3407test,
                        'assignment': req.body.CA3407assignment,
                        'end': req.body.CA3407end,
                        'total': parseInt(req.body.CA3407mid) + parseInt(req.body.CA3407test) + parseInt(req.body.CA3407assignment) + parseInt(req.body.CA3407end)
                    }
                });

                marksFour.save(function (err, data) {
                    if (err) throw error;
                  res.render('uploadmarks', {
                    success: 'Record inserted successfully!',
                    u_name: loginUser,
                    currentDate: moment().format("dddd[,] ll"),
                    currentTime: moment().format(' h:mm A')
                  });
                    console.log(data);
                })
            }

            if (req.body.sem == 'V') {
                console.log('fifth');
                var marksFive = new marksModel.firstMarksModel({
                    'regd': req.body.regd,
                    'sem': req.body.sem,
                    'CA3501': {
                        'mid': req.body.CA3501mid,
                        'test': req.body.CA3501test,
                        'assignment': req.body.CA3501assignment,
                        'end': req.body.CA3501end,
                        'total': parseInt(req.body.CA3501mid) + parseInt(req.body.CA3501test) + parseInt(req.body.CA3501assignment) + parseInt(req.body.CA3501end)
                    },
                    'CA3502': {
                        'mid': req.body.CA3502mid,
                        'test': req.body.CA3502test,
                        'assignment': req.body.CA3502assignment,
                        'end': req.body.CA3502end,
                        'total': parseInt(req.body.CA3502mid) + parseInt(req.body.CA3502test) + parseInt(req.body.CA3502assignment) + parseInt(req.body.CA3502end)
                    },
                    'CA3503': {
                        'mid': req.body.CA3503mid,
                        'test': req.body.CA3503test,
                        'assignment': req.body.CA3503assignment,
                        'end': req.body.CA3503end,
                        'total': parseInt(req.body.CA3503mid) + parseInt(req.body.CA3503test) + parseInt(req.body.CA3503assignment) + parseInt(req.body.CA3503end)
                    },
                    'CA3504': {
                        'mid': req.body.CA3504mid,
                        'test': req.body.CA3504test,
                        'assignment': req.body.CA3504assignment,
                        'end': req.body.CA3504end,
                        'total': parseInt(req.body.CA3504mid) + parseInt(req.body.CA3504test) + parseInt(req.body.CA3504assignment) + parseInt(req.body.CA3504end)
                    },
                    'CA3505': {
                        'mid': req.body.CA3505mid,
                        'test': req.body.CA3505test,
                        'assignment': req.body.CA3505assignment,
                        'end': req.body.CA3505end,
                        'total': parseInt(req.body.CA3505mid) + parseInt(req.body.CA3505test) + parseInt(req.body.CA3505assignment) + parseInt(req.body.CA3505end)
                    },
                    'HS3501': {
                        'mid': req.body.HS3501mid,
                        'test': req.body.HS3501test,
                        'assignment': req.body.HS3501assignment,
                        'end': req.body.HS3501end,
                        'total': parseInt(req.body.HS3501mid) + parseInt(req.body.HS3501test) + parseInt(req.body.HS3501assignment) + parseInt(req.body.HS3501end)
                    },
                    'HS3502': {
                        'mid': req.body.HS3502mid,
                        'test': req.body.HS3502test,
                        'assignment': req.body.HS3502assignment,
                        'end': req.body.HS3502end,
                        'total': parseInt(req.body.HS3502mid) + parseInt(req.body.HS3502test) + parseInt(req.body.HS3502assignment) + parseInt(req.body.HS3502end)
                    }
                });


                marksFive.save(function (err, data) {
                  if (err) throw error;
                  res.render('uploadmarks', {
                    success: 'Record inserted successfully!',
                    u_name: loginUser,
                    currentDate: moment().format("dddd[,] ll"),
                    currentTime: moment().format(' h:mm A')
                  });
                    console.log(data);
                })
            }

            if (req.body.sem == 'VI') {
              console.log('sixth');
              var marksSix = new marksModel.firstMarksModel({
                'regd': req.body.regd,
                'sem': req.body.sem,
                'CA3601': {
                  'project': req.body.CA3601project,
                  'total': parseInt(req.body.CA3601project)
                }
              });

              marksSix.save(function (err, data) {
                if (err) throw error;
                var loginUser = localStorage.getItem('loginUser');
                
                res.render('uploadmarks', {
                  success: 'Record inserted successfully!',
                  u_name: loginUser,
                  currentDate: moment().format("dddd[,] ll"),
                  currentTime: moment().format(' h:mm A')
                });
                console.log(data);
              });
            }
        }
        else {
          var loginUser = localStorage.getItem('loginUser');
          res.render('uploadmarks', {
            success: 'Record already present',
            u_name: loginUser,
            currentDate: moment().format("dddd[,] ll"),
            currentTime: moment().format(' h:mm A')
          });
        }

    });
  
});
/*-----------VIEW MARKS----------------*/
router.get('/result', checkLogin, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  res.render('result', {
    u_name: loginUser,
    currentDate: moment().format("dddd[,] ll"),
    currentTime: moment().format(' h:mm A'),
    title: 'Student record',
    records: ''
  });
  
});

router.post('/result', checkLogin, function (req, res) {
  var loginUser = localStorage.getItem('loginUser');
  var result = marks.find({ sem: req.body.slct2, regd: req.body.regd });
  console.log(req.body.slct2);
  console.log(req.body.regd);
  result.exec(function(err,data){
    if(err) throw err;
    console.log(data);
    res.render('result', {
      u_name: loginUser,
      currentDate: moment().format("dddd[,] ll"),
      currentTime: moment().format(' h:mm A'),
      title: 'Student record',
      records: data
    });
  
  })
});

/* ----------SIGNOUT--------------- */
router.get('/signout', function (req, res, next) {
  
  req.session.destroy(function (err) {
    if (err) {
      res.redirect('/');
    }
  });
  // localStorage.removeItem('userToken');
  // localStorage.removeItem('loginUser');
  // localStorage.removeItem('userType');
  // localStorage.removeItem('userSem');
  localStorage.clear();
  res.redirect('/');
});

module.exports = router;

