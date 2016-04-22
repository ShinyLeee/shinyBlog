var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shinyBlog');

module.exports = mongoose;
