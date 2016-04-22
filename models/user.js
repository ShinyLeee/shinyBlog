var mongoose = require('./db');
var userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String
}, {
    collection: 'users' 
});

var userModel = mongoose.model('User', userSchema); 

function User(user) {
    this.name = user.name,
    this.password = user.password,
    this.email = user.email
}

module.exports = User;

User.prototype.save = function(callback) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    var newUser = new userModel(user);
    newUser.save(function(err) {
        if(err) {
            return callback(err.toString());
        }
        callback(null);
    });
};

User.get = function(name, callback) {
    userModel.findOne({
        name: name
    }, function(err, user) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, user);
    });
};