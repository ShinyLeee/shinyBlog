var mongoose = require('./db.js');
var hljs = require('highlight.js');
var ObjectID = require('mongodb').ObjectID;
var markdown = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value + '</code></pre>';
            } 
            catch (ex) { throw ex; }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});


//以文件形式存储的数据库模型骨架
var postSchema = new mongoose.Schema({
    name: String,
    title: String,
    post: String,
    room: String,
    time: Object,
    star: Boolean
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
        star: false
    };
    
    //由Model生成的Entity实体
    var newPost = new postModel(post); 
    
    newPost.save(function(err, post) {
        if(err) {
            return callback(err);
        }
        callback(null);
    });
};

//获取单篇文章
Post.getOne = function(_id, callback) {
    postModel.findOne({
        _id: new ObjectID(_id)
    }, function(err, doc) {
        if(err) {
            return callback(err.toString());
        }
        doc.post = markdown.render(doc.post);
        callback(null, doc);
    });
};

Post.getAll = function(name, callback) {
    postModel.find({
        name: name
    }).exec(function(err, docs) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, docs);
    })
}

//根据时间排序获取5篇文章
Post.getDefault = function(page, room, callback) {
    var query = {};
    if (room) {
        query.room = room;
    }
    postModel.count(query, function(err, total) {
        postModel.find(query)
        .skip((page - 1) * 5)
        .limit(5)
        .sort({
            time: -1
        }).exec(function(err, docs) {
            if(err) {
                return callback(err.toString());
            }
            docs.forEach(function(doc, index) {
                doc.post = markdown.render(doc.post);
            })
            callback(null, docs, total);
        });      
    })
};

//获取文章数量
Post.getLength = function(name, callback) {
    
    postModel.count(name, function(err, total) {
        if(err) {
            return callback(err.toString());
        }
        callback(null, total);
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
    }, function(err, doc) {
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
Post.search = function(title, callback) {
    postModel.findOne({
        title: new RegExp(title, 'i')
    }, function(err, doc) {
        if(err) {
            return callback(err.toString());
        } 
        if(doc) {
            doc.post = markdown.render(doc.post);
            callback(null, doc);  
        }
        else {
            callback(null, null);
        }
    });
};


Post.preview = function(article, callback) {
    if(article) {
        article = markdown.render(article);
        callback(null, article);
    }
};

//收藏文章
Post.makeStar = function(postID, callback) {
    postModel.update({
        _id: new ObjectID(postID),
        star: false
    }, {
        $set: {star: true}
    }, function(err, status) {
        if(err) {
            return callback(err.toString());
        }
        if(!status.n) {
            postModel.update({
                _id: new ObjectID(postID),
                star: true
            }, {
                $set: {star: false}
            }, function(err, status) {
                if(err) {
                    return callback(err.toString());
                }
                callback(null, false);
            })
        }
        else if (status.n) {
            callback(null, true);
        }
    });
};

//获取所有收藏文章
Post.getStarred = function(callback) {
    postModel.find({ star: true }, function(err, docs) {
        if(err) {
            return callback(err.toString());
        }
        docs.forEach(function(doc, index) {
            doc.post = markdown.render(doc.post);
        });
        callback(null, docs);
    });
};