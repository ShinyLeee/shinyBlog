var mongoose = require('./db.js');

var adminSchema = new mongoose.Schema({
    like: Object,
    statistics: Object
}, {
    collection: 'admin'
});

var adminModel = mongoose.model('Admin', adminSchema);

module.exports = Admin;

function Admin(admin) {
    this.count = 0,
    this.ip = null,
    this.location = null
}

/* Admin.saveLike = function (callback) {
    adminModel.update({
        like: 
    })
} */