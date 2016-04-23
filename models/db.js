var mongoose = require('mongoose');

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") {
  mongoose.connect('mongodb://shiny:shinystar_7@ds041144.mlab.com:41144/shinyblog');
}
else {
  mongoose.connect('mongodb://localhost/shinyBlog');
}


//

module.exports = mongoose;
