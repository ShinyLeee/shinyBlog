var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var multer = require('multer');
var needle = require('needle');
var getmac = require('getmac');
var User = require('../models/user');
var Post = require('../models/post');
var Admin = require('../models/admin');

//添加multer上传文件模块
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/upload');
  },
  filename: function(req , file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

var upload = multer({
  storage: storage
});

/*-------------上传模块---------------*/
router.post('/upload', upload.single('img'), function(req, res) {
    res.send(req.file.path);
})

/* GET home page. */
router.get('/', function(req, res, next) {
    var page = parseInt(req.query.p) || 1;
    
    Post.getDefault(page, null, function(err, posts, total) {
        if(err) {
            posts = [];
        }
        res.render('index', {
            channel: '首页',
            user: req.session.user,
            posts: posts,
            page: page,
            counts: req.session.likesCount,
            isFirstPage: (page - 1) == 0,
            isLastPage: (page - 1) * 5 + posts.length == total,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

/*-------------登录登出模块---------------*/
router.get('/logout', isLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    return res.redirect('/');
})

router.post('/login', function(req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    
    User.get(req.body.name, function(err, user) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if(!user) {
            req.flash('error', '该用户不存在');
            return res.redirect('/');
        }
        if(user.password != password) {
            req.flash('error', '密码不正确');
            return res.redirect('/');
        }
        //用户名和密码都匹配后将用户信息存入session
        req.session.user = user;
        req.flash('success', '登录成功');
        res.redirect('/');
    })
})


/*-------------注册模块---------------*/

router.post('/register', function(req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    var user = {
        name: req.body.name,
        password: password,
        email: req.body.email
    }
    var newUser = new User(user);
    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if(user) {
            req.flash('error', '用户已存在');
            return res.redirect('/');
        }
        newUser.save(function(err, user) {
            if(err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.session.user = newUser;
            req.flash('success', '注册成功');
            res.redirect('/');
        });
    });
});

/*-------------发表文章模块---------------*/
router.get('/post', isLogin);
router.get('/post', function(req, res) {
    res.render('post', {
        channel: "发表文章",
        counts: req.session.likesCount,
        user: req.session.user,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
    });
});

router.post('/post', isLogin);
router.post('/post', function(req, res) {
    var currenUser = req.session.user;
    var post = {
        name: currenUser.name,
        title: req.body.title,
        post: req.body.post,
        room: req.body.room
    }
    if (post.name && post.title && post.post && post.room) {
        var newPost = new Post(post);
        newPost.save(function(err) {
            if(err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '文章发表成功');
            return res.redirect('/');
        });
    }
    else {
        req.flash('error', '请检查文章输入是否完整');
        return res.redirect('back');
    }
});
/*-------------编辑、删除文章模块---------------*/
router.get('/edit/:_id', isLogin);
router.get('/edit/:_id', function(req, res) {
    var _id = req.params._id;
    Post.edit(_id, function(err, post) {
        res.render('edit', {
            channel: '编辑',
            post: post,
            counts: req.session.likesCount,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString() 
        });
    });
});

router.post('/edit/:_id', isLogin);
router.post('/edit/:_id', function(req, res) {
    var _id = req.params._id;
    Post.update(_id, req.body.post, function(err) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '文章修改成功');
        res.redirect('/');
    });
});

router.get('/delete/:_id', isLogin);
router.get('/delete/:_id', function(req, res) {
    var _id = req.params._id;
    Post.remove(_id, function(err) {
        if(err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '删除成功');
        res.redirect('/');
    });
});
/*-------------获取单篇/用户全部文章模块---------------*/
router.get('/p/:_id', function(req, res) {
    var _id = req.params._id;
    
    Post.getOne(req.params._id, function(err, post) {
        if(err) {
            post = null;
            req.flash('error', '获取文章失败');
        }
        res.render('article', {
            channel: '文章',
            user: req.session.user,
            star: req.session.star,
            counts: req.session.likesCount,
            isStar: req.session[_id],
            post: post,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        })
    });
});

/*-------------ROOM文章模块---------------*/
router.get('/study', getRoom);

router.get('/kitchen', getRoom);

router.get('/living', getRoom);

router.get('/yard', getRoom);

/*-------------Search文章模块---------------*/
router.get('/search', function(req, res) {
    var _id = req.params._id;
    
    Post.search(req.query.keyword, function(err, post) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if(!post) {
            req.flash('error', '该文章不存在');
            return res.redirect('/');
        }
        res.render('article', {
            channel: "搜索结果",
            post: post,
            counts: req.session.likesCount,
            isStar: req.session[_id],
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

/*-------------Archive文章模块---------------*/
router.get('/archive', function(req, res) {
    Post.getArchive(function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('archive', {
            channel: "存档",
            posts: posts,
            counts: req.session.likesCount,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});
/*-------------Star文章模块---------------*/
router.get('/star', function(req, res) {
    Post.getStarred(function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('star', {
            channel: "已收藏",
            posts: posts,
            star: req.session.star,
            counts: req.session.likesCount,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

/*-------------About文章模块---------------*/
router.get('/about', function(req, res) {
    res.render('about', {
        channel: "关于",
        user: req.session.user,
        counts: req.session.likesCount,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
    });
});

module.exports = router;


/*-------------AJAX模块---------------*/

//AJAX检测用户是否存在
router.get('/hasAccount', function(req, res) {
    var account = req.query.name;
    
    User.get(account, function(err, user) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.send(!user);
    });
});

//AJAX检测当前文章数量
router.get('/getPostLength', function(req, res) {
    var name = req.query.name;
    
    Post.getLength(name, function(err, length) {
        if(err) {
            return;
        }
        //res.send(paramter) 
        //--> parameter Only can be [Object] [Array] [String] or [Buffer Object]
        //Not [Number]
        res.json(length);
    });
});

//AJAX获取实时预览文章
router.get('/preview', function(req, res) {
    var article = req.query.article;
    
    Post.preview(article, function(err, article) {
        if(err) {
            console.log(err);
            return;
        }
        res.json(article);
    });
});

//Ajax添加收藏文章
router.get('/makeStar', function(req, res) {
    var postID = req.query.postID;
    
    Post.makeStar(postID, function(err, status) {
        if(err) {
            res.send('Database Connect Error, Please try again later');
            return;
        }
        if (status) {
            //[]里才能获取postID变量
            req.session[postID] = "starred";
            res.send('收藏成功');
        }
        else {
            req.session[postID] = null;
            res.send('取消收藏成功');
        }
        
    });
});

//Ajax点赞网站
router.get('/giveLike', function(req, res) {
    
    getmac.getMac(function(err, mac) {
        if (err) throw err;
        
        var macAddress = mac;
        var date = new Date();
        var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
       
        Admin.checkLiked(macAddress, function(err, status) {
            if(err) {
                res.send('Database Connect Error, Please try again later');
            }
            if (!status) {
                needle.get('http://pv.sohu.com/cityjson?ie=utf-8', function(err, response) {
                    var ipDetail = JSON.parse(response.body.slice(18, -1));
                    var cip = ipDetail.cip;
                    var cname= ipDetail.cname;
                    var cid = ipDetail.cid; 
                    
                    var admin = {
                        cip: cip,
                        cname: cname,
                        cid: cid,
                        macAddress: macAddress,
                        time: time
                    }
                    
                    var newAdmin = new Admin(admin);
                
                    newAdmin.saveLike(function(err, count) {
                        if (err) {
                            res.send('Database Connect Error, Please try again later');
                        }
                        req.session.likesCount = count;
                        res.json(req.session.likesCount);
                    });
                });
            }
            else {
                res.json('Liked');
            }
        });            
    });      
});


function isLogin (req, res, next) {
    if(!req.session.user) {
        req.flash('error', '您尚未登录');
        return res.redirect('/');
    }
    next();
}

function getRoom (req, res) {
    //首字母大写
    var path = req.path.slice(1).replace(/(\w)/,function(v){return v.toUpperCase()});
    
    switch (path) {
        case 'Study': channel = '书房'; break;
        case 'Kitchen': channel = '厨房'; break;
        case 'Living': channel = '生活'; break;
        case 'Yard': channel = '杂谈'; break;
    }
    var page = req.query.p || 1;
    
    Post.getDefault(page, path, function(err, posts, total) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('index', {
            channel: channel,
            posts: posts,
            page: page,
            counts: req.session.likesCount,
            isFirstPage: (page - 1) == 0,
            isLastPage: (page - 1) * 5 + posts.length == total,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
}