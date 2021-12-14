var mongoose = require('mongoose');

const DB = "mongodb+srv://Bist_Man:qwerty123@cluster0.uurus.mongodb.net/nitjDB?retryWrites=true&w=majority";
//mongoose.connect(DB , {useNewUrlParser: true});
mongoose.connect(DB , {useNewUrlParser: true},function(err){
    if(!err)
        console.log("Database Connected..👍");
    else
        console.log(err);

});
var conn = mongoose.Collection;

var mca_studentSchema= new mongoose.Schema({
    id: {type: String, required: true, unique: true },
    first_name: {type: String, required: true },
    last_name: {type: String, required: true },
    password: {type: String, required: true },
    semester:{ type: Number, min: 1, max:6, required: true }
});


var McaStudent = mongoose.model('mca_student', mca_studentSchema);
module.exports = McaStudent;
