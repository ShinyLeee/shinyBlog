var mongoose = require('./db.js');

var adminSchema = new mongoose.Schema({
    stats: Object
}, {
    collection: 'admin'
});

var adminModel = mongoose.model('Admin', adminSchema);

module.exports = Admin;


function Admin(admin) {
    this.stats = admin.stats
};

Admin.saveLike = function (ip, callback) {
    var date = new Date();
    var stats = {
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
        ip: ip
    }
    var admin = {
        stats: stats
    }
    var newAdmin = new adminModel(admin);
    
    newAdmin.save(function(err, doc) {
        if (err) {
            return callback(err.toString());
        }
        callback(null, doc);
    });
};

Admin.checkLiked = function (ip, callback) {
    adminModel.findOne({
        ip: ip
    }, function(err, doc) {
        if (err) {
            return callback(err.toString());
        }
        callback(null, doc);
    });
};