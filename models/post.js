var mongoose = require('./db');
var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;

//以文件形式存储的数据库模型骨架
var postSchema = new mongoose.Schema({
    name: String,
    title: String,
    post: String,
    room: String,
    time: Object,
    comment: Array
}, {
    collection: 'posts' 
});

//由schema生成的数据库模型
var postModel = mongoose.model('Post', postSchema);

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
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
        time: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        day: date.getDate(),
        month: m,
        year: date.getFullYear(),
        date: date
    };
    var post = {
        name: this.name,
        title: this.title,
        post: this.post,
        room: this.room,
        time: time,
        comment: []
    };
    
    //由Model生成的Entity实体
    var newPost = new postModel(post); 
    
    newPost.save(function(err, post) {
        if(err) {
            return callback(err);
        }
        callback(null, post);
    });
};

//获取单篇文章
Post.getOne = function(_id, name, callback) {
    postModel.findOne({
        _id: new ObjectID(_id)
    }, function(err, doc) {
        if(err) {
            return callback(err.toString());
        }
        if(name) {
            postModel.find({
                name: name
            }).exec(function(err, docs) {
                if(err) {
                    return callback(err.toString());
                }
                callback(null , doc, docs);
            });
        }
        if(!name) {
            doc.post = markdown.toHTML(doc.post);
            callback(null, doc);
        } 
    });
};

//获取用户所有文章或根据时间排序获取所有文章
Post.getDefault = function(name, room, callback) {
    var query = {};
    if (name) {
        query.name = name;
    }
    if (room) {
        query.room = room;
    }
    postModel.find(query).sort({
        time: -1
    }).exec(function(err, docs) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, docs);
    });      
};

//获取文章数量
Post.getStatus = function(name, callback) {
    postModel.find({
        name: name
    }).exec(function(err, docs) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, docs);
    });
};

//存档
Post.getArchive = function(callback) {
    postModel.find({}, {
        time: 1,
        title: 1,
        _id: 1
    }).sort({time: -1}).exec(function(err, docs) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, docs);
    });
};

//获取待编辑文章
Post.edit = function(_id, callback) {
    postModel.findOne({
        _id: new ObjectID(_id)
    }, function(err, doc) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, doc);
    });
};

//更新文章
Post.update = function(_id, post, callback) {
    postModel.update({
        _id: new ObjectID(_id)
    }, {
        $set: {post: post}
    }, function(err) {
        if(err) {
            return callback(err.toString());
        }
        callback(null);
    });
};

//删除文章
Post.remove = function(_id, callback) {
    postModel.remove({
        _id: new ObjectID(_id)
    }, function(err) {
        if(err) {
            return callback(err.toString());
        }
        callback(null)
    });
};

//查找文章
Post.search = function(title, name, callback) {
    postModel.findOne({
        title: title
    }, function(err, doc) {
        if(err) {
            return callback(err.toString());
        } 
        if(name) {
            postModel.find({
                name: name
            }, function(err, docs) {
                if(err) {
                    return callback(err.toString());
                }
                callback(null, doc, docs);
            })
        }
        if(!name) {
            callback(null, doc);
        }
    });
};