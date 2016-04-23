var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://shiny:shinystar_7@ds041144.mlab.com:41144/shinyblog');


module.exports = mongoose;
