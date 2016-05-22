var mongoose = require('./db.js');

var adminSchema = new mongoose.Schema({
    cip: String,
    cname: String,
    cid: Number,
    macAddress: String,
    time: String
}, {
    collection: 'admin'
});

var adminModel = mongoose.model('Admin', adminSchema);

module.exports = Admin;


function Admin(admin) {
    this.cip = admin.cip,
    this.cname = admin.cname,
    this.cid = admin.cid,
    this.macAddress = admin.macAddress,
    this.time = admin.time
};

Admin.prototype.saveLike = function (callback) {
       
    var admin = {
        cip: this.cip,
        cname: this.cname,
        cid: this.cid,
        macAddress: this.macAddress,
        time: this.time
    }
    
    var newAdmin = new adminModel(admin);
    
    newAdmin.save(function(err) {
        if (err) {
            return callback(err.toString());
        }
        adminModel.count(function(err, total) {
            if(err) {
                return callback(err.toString());
            }
            callback(null, total);
        });
    });
};

Admin.checkLiked = function (macAddress, callback) {
    adminModel.findOne({
        macAddress: macAddress
    }, function(err, doc) {
        if (err) {
            return callback(err.toString());
        }
        callback(null, doc);
    });
};