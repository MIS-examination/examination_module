var mongoose = require('mongoose');

const DB = "mongodb+srv://Bist_Man:qwerty123@cluster0.uurus.mongodb.net/nitjDB?retryWrites=true&w=majority";
//mongoose.connect(DB , {useNewUrlParser: true});
mongoose.connect(DB , {useNewUrlParser: true},function(err){
    if(!err)
        console.log("Database Connected..😌");
    else
        console.log(err);

});
//var conn = mongoose.Collection;

var teacherSchema= new mongoose.Schema({
    id: {type: String, required: true, unique: true },
    first_name: {type: String, required: true },
    last_name: {type: String, required: true },
    password: {type: String, required: true },
});


var Teacher = mongoose.model('teacher', teacherSchema);
module.exports = Teacher;


                                                                                                  

// <% examDetails.forEach(function(examDetails) { %>
// <td style="width:10px;text-align:center;"> <%= i+1 %> </td>
// <td style="width:200px;text-align:left;padding-left:10px;">
// <%= examDetails[i].id+ " - " +examDetails[i].name %> </td>
// <td style="width:80px;text-align:center;">
// <%= examDetails[i].exam_date %> </td>
// <% }); %>