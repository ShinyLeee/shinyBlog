var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');


/* GET home page. */
router.get('/', function(req, res, next) {
    Post.getDefault(null, null, function(err, posts) {
        if(err) {
            posts = [];
        }
        res.render('index', {
            page: 'Home',
            user: req.session.user,
            posts: posts,
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
router.get('/hasAccount', function(req, res) {
    //AJAX检测用户是否存在
    var account = req.query.name;
    User.get(account, function(err, user) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.send(!user);
    })
})
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
        page: "Post",
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
    var newPost = new Post(post);
    newPost.save(function(err) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '文章发表成功');
        return res.redirect('/');
    });
});
/*-------------编辑、删除文章模块---------------*/
router.get('/edit/:_id', isLogin);
router.get('/edit/:_id', function(req, res) {
    var _id = req.params._id;
    Post.edit(_id, function(err, post) {
        res.render('edit', {
            page: 'Edit',
            post: post,
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
    Post.getOne(req.params._id, function(err, post, posts) {
        if(err) {
            post = null;
            req.flash('error', '获取文章失败');
        }
        res.render('article', {
            page: 'Article',
            user: req.session.user,
            post: post,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        })
    });
});

router.get('/user/:username', function(req, res) {
    var currenUser = req.session.user;
    Post.getDefault(req.params.username, null, function(err, posts) {
        if(err) {
            posts = [];
        }
        res.render('index', {
            page: currenUser.name,
            user: req.session.user,
            posts: posts,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

/*-------------ROOM文章模块---------------*/
router.get('/study', function(req, res) {
    Post.getDefault(null, 'Study', function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('index', {
            page: "Study",
            posts: posts,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

router.get('/kitchen', function(req, res) {
    Post.getDefault(null, 'Kitchen', function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('index', {
            page: "Kitchen",
            posts: posts,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

router.get('/living', function(req, res) {
    Post.getDefault(null, 'Living', function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('index', {
            page: "Living",
            posts: posts,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});

router.get('/yard', function(req, res) {
    Post.getDefault(null, 'Yard', function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('index', {
            page: "Yard",
            posts: posts,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});
/*-------------Search文章模块---------------*/
router.get('/search', function(req, res) {
    Post.search(req.query.keyword, function(err, post, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if(!post) {
            req.flash('error', '该文章不存在');
            return res.redirect('/');
        }
        res.render('article', {
            page: "Search",
            post: post,
            posts: posts,
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
            page: "Archive",
            posts: posts,
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });
});
/*-------------About文章模块---------------*/
router.get('/about', function(req, res) {
    res.render('about', {
        page: "About Me",
        user: req.session.user,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
    });
});

module.exports = router;

function isLogin (req, res, next) {
    if(!req.session.user) {
        req.flash('error', '您尚未登录');
        return res.redirect('/');
    }
    next();
}