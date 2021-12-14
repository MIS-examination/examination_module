//const { ISO_8601 } = require('moment');
var mongoose = require('mongoose');

const DB = "mongodb+srv://Bist_Man:qwerty123@cluster0.uurus.mongodb.net/nitjDB?retryWrites=true&w=majority";
mongoose.connect(DB , {useNewUrlParser: true});
var conn = mongoose.Collection;

// var subjectSchema = new mongoose.Schema({
//     id: {type: String, required: true, unique: true },
//     name: {type: String, required: true },
//     exam_date: {type: Date, required: true, default: Date.now() }
// });

var examSchema= new mongoose.Schema({
    semester : {type: Number, min: 1, max:6, required: true, unique: true},
    subjects : [{   
        id: {type: String, required: true, unique: true },
        name: {type: String, required: true },
        exam_date: {type: Date, required: true, default: Date.now() }
    }] 
   
});


var Exam = mongoose.model('exam', examSchema);



// var object = {
//     semester: 1,
//     subjects: [
//         {
//             id: "MA3101",
//             name: "Mathematical Foundation of Computer Application",
//             exam_date: new Date()
//         },
//         {
//             id: "MA3103",
//             name: "Probability and Statistical Computing",
//             exam_date: new Date()
//         },
//         {
//             id: "CA3101",
//             name: "Computer Programming and Problem Solving using C",
//             exam_date: new Date()
//         },
//         {
//             id: "CA3102 ",
//             name: "Computer Organization and Architecture",
//             exam_date: new Date()
//         },
//         {
//             id: "CA3103 ",
//             name: "Resource Management Techniques",
//             exam_date: new Date()
//         },
//         {
//             id: "CA3104 ",
//             name: "Computer Programming in C Lab",
//             exam_date: new Date()
//         },
//         {
//             id: "CA3105",
//             name: "Statistical and Optimization Techniques Lab",
//             exam_date: new Date()
//         }
//     ]

// }

// Exam.insertMany(object, function (err, result) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(result);
//     }
// });

// const e1 = new Exam({
//     semester: 4,
//     subjects: [
//         { id: "CA3401", name: "Software Engineering" },
//         { id: "CA3402", name: "Artificial Intelligence" },
//         { id: "CA3403", name: "Internet and Web Technology" },
//         { id: "CA3404", name: "Elective – I" },
//         { id: "CA3405", name: "Elective – II" },
//         { id: "CA3406", name: "Web Technology Lab" },
//         { id: "CA3407", name: "Elective Lab" },
//     ]
// });
 
// const e2 = new Exam({
//     semester: 5,
//     subjects: [
//         { id: "HS3501", name: "Financial Management " },
//         { id: "HS3502", name: "Organization Behaviour and Management" },
//         { id: "CA3501", name: "Unix & Shell Programming " },
//         { id: "CA3502", name: "Elective – III" },
//         { id: "CA3503", name: "Elective – IV" },
//         { id: "CA3504", name: "OS and Network Lab" },
//         { id: "CA3505", name: "Mini Project Work" },
//     ]
// });
//  const e3 = new Exam({
//     semester: 6,
//     subjects: [
//         { id: "CA3601", name: "Thesis / Project / Industrial Project" },
//     ]
// });
 
// e1.save();
// e2.save();
// e3.save();

// Exam.findOneAndUpdate({ 'subjects.id': 'CA3301' }, { 'subjects.exam_date': new Date("2021-12-13T00:00:00")}, function (err) {

//     if (err) console.log(err);
//     else console.log("updated");    
// });

module.exports = Exam;