//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/shinyblog');
var MongoClient = require('mongodb').MongoClient,
    test = require('assert');
var url = 'mongodb://localhost:27017/shinyBlog';
var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;

/*var postSchema = new mongoose.Schema({
    _id: ObjectID,
    name: String,
    title: String,
    post: String,
    room: String,
    time: Object,
    comment: Array
}, {
  collection: 'posts' 
});

var postModel = mongoose.model('posts', postSchema);*/

function Post(post) {
    this.name = post.name,
    this.title = post.title,
    this.post = post.post,
    this.room = post.room
}

module.exports = Post;

//保存文章
Post.prototype.save = function(callback) {
    var date = new Date();
    var m = date.getMonth() + 1;
    switch(m) {
        case 1: m = "Jan"; break;
        case 2: m = "Feb"; break;
        case 3: m = "Mar"; break;
        case 4: m = "Apr"; break;
        case 5: m = "May"; break;
        case 6: m = "Jun"; break;
        case 7: m = "Jul"; break;
        case 8: m = "Aug"; break;
        case 9: m = "Sep"; break;
        case 10: m = "Oct"; break;
        case 11: m = "Nov"; break;
        case 12: m = "Dec"; break; 
    }
    var time = {
        date: date,
        year: date.getFullYear(),
        month: m,
        day: date.getDate(),
        time: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        room: this.room,
        time: time,
        comment: []
    };
    MongoClient.connect(url, function(err, db) {
        if(err) {
            return callback(err.toString());
        }
        db.collection('posts', function(err, collection) {
            if(err) {
                db.close();
                return callback(err.toString());
            }
            collection.insert(post, {
                safe: true
            }, function(err) {
                db.close();
                if(err) {
                    return callback(err.toString());
                }
                callback(null);
            });
        }); 
    });
};

//获取待编辑文章
Post.edit = function(_id, callback) {
        db.collection('posts', function(err, collection) {
            if(err) {
                pool.release(mongodb);
                return callback(err.toString());
            }
            collection.findOne({
                _id: new ObjectID(_id)
            }, function(err, doc) {
                pool.release(mongodb);
                if(err) {
                    return callback(err.toString());
                }
                callback(null, doc);
            });
        });
};

//更新文章
Post.update = function(_id, post, callback) {
    pool.acquire(function(err, mongodb) {
        if(err) {
            pool.release(mongodb);
            return callback(err.toString());
        }
        mongodb.collection('posts', function(err, collection) {
            if(err) {
                console.log(err+'2');
                pool.release(mongodb);
                return callback(err.toString());
            }
            collection.update({
                _id: new ObjectID(_id)
            }, {
                $set:{post: post}
            }, function(err) {
                pool.release(mongodb);
                if(err) {
                    return callback(err.toString());
                }
                callback(null);
            });
        });
    });
};

//删除文章
Post.remove = function(_id, callback) {
    pool.acquire(function(err, mongodb) {
        if(err) {
            pool.release(mongodb);
            return callback(err.toString());
        }
        mongodb.collection('posts', function(err, collection) {
            if(err) {
                pool.release(mongodb);
                return callback(err.toString());
            }
            collection.remove({
                _id: new ObjectID(_id)
            }, {
                w: 1
            }, function(err) {
                pool.release(mongodb);
                if(err) {
                    return callback(err.toString());
                }
                callback(null);
            });
        });
    });
};

//获取单篇文章
Post.getOne = function(_id, name, callback) {
    pool.acquire(function(err, mongodb) {
        if(err) {
            pool.release(mongodb);
            return callback(err.toString());
        }
        mongodb.collection('posts', function(err, collection) {
            if(err) {
                pool.release(mongodb);
                return callback(err.toString());
            }
            collection.findOne({
                _id: new ObjectID(_id)
            }, function(err, doc) {
                if(err) {
                    return callback(err.toString());
                }
                if(name) {
                    collection.find({
                        name: name
                    }).toArray(function(err, docs) {
                        pool.release(mongodb);
                        if(err) {
                            return callback(err.toString());
                        }
                        callback(null, doc, docs);
                    });
                }
                if(!name){
                    doc.post = markdown.toHTML(doc.post);
                    callback(null, doc);
                }
            });
        });
    });
};

//获取文章数量
Post.getStatus = function(name, callback) {
    pool.acquire(function(err, mongodb) {
        if(err) {
            pool.release(mongodb);
            return callback(err.toString());
        }
        mongodb.collection('posts', function(err, collection) {
            if(err) {
                pool.release(mongodb);
                return callback(err.toString());
            }
            collection.find({
                name: name
            }).toArray(function(err, docs) {
                pool.release(mongodb);
                if(err) {
                    return callback(err.toString());
                }
                callback(null, docs);
            });
        });
    });
};

//获取用户所有文章或根据时间排序获取所有文章
Post.getDefault = function(name, room, callback) {
    MongoClient.connect(url, function(err, db) {
        if(err) {
            return callback(err.toString());
        }
        db.collection('posts', function(err, collection) {
            if(err) {
                db.close();
                return callback(err.toString());
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            if (room) {
                query.room = room;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function(err, docs) {
                test.equal(null, err);        //检测err是否不存在
                db.close();
                if(err) {
                    return callback(err.toString());
                }
                docs.forEach(function(doc, index) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs); 
            });
        });
    });          
};

//存档
Post.getArchive = function(callback) {
    pool.acquire(function(err, mongodb) {
        if(err) {
            pool.release(mongodb);
            return callback(err.toString());
        }
        mongodb.collection('posts', function(err, collection) {
            if(err) {
                pool.release(mongodb);
                return callback(err.toString());
            }
            collection.find({}, {
                time: 1,
                title: 1,
                _id: 1
            }).sort({time: -1}).toArray(function(err, docs) {
                pool.release(mongodb);
                if(err) {
                    return callback(err.toString());
                }
                callback(null, docs);
            });
        });
    });
};

