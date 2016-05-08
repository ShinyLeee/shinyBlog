


$(function(){
    $('[data-toggle="tooltip"]').tooltip();
    
    //获取当前文章数量
    $(window).on('load', function() {
        var user = $('#user').find('.info').children('span').text();
        var name = 'name='+user;
        $.ajax({
            type: 'GET',
            url: '/getPostLength',
            data: name,
            success: function(passageLength) {
                $('.user-passage').children('p').text(passageLength);
            },
            error: function(XML, textStatus, err) {
                console.log(XML + textStatus + err);
            }
        })
    })
    
    $(window).on('scroll', function() {
        var scrollTop = document.body.scrollTop;
        if (scrollTop > 400) {
            $('#back-top').fadeIn();
        }
        else {
            $('#back-top').fadeOut();
        }
    })
    
    //预览文章修改
    $('#edit-preview, #post-preview').on('click', function() {
        var article = $('#edit').val();
        var loadFlash = '<div class="sk-cube-grid" style="display: none;">'+
                        '<div class="sk-cube sk-cube1"></div>'+
                        '<div class="sk-cube sk-cube2"></div>'+
                        '<div class="sk-cube sk-cube3"></div>'+
                        '<div class="sk-cube sk-cube4"></div>'+
                        '<div class="sk-cube sk-cube5"></div>'+
                        '<div class="sk-cube sk-cube6"></div>'+
                        '<div class="sk-cube sk-cube7"></div>'+
                        '<div class="sk-cube sk-cube8"></div>'+
                        '<div class="sk-cube sk-cube9"></div>'+'</div>';
        $('#preview').html(loadFlash);
        if(article) { $('.sk-cube-grid').show(); }
        var begin = new Date();
        $.ajax({
            type: 'GET',
            url: '/preview',
            data: {article: article},
            success: function(data) {
                var end = new Date();
                if (end - begin > 1500) {
                    $('#preview').html(data);
                }
                else {
                    var timespan = 1500 - (end - begin);
                    setTimeout(function() {
                        $('#preview').html(data);
                    }, timespan);
                }
            },
            error: function(XML, textStatus, err) {
                console.log(XML + textStatus + err);
            }
        })
    })
    
    //收藏模块
    $('#post-star').one('click', function() {
        var $this = $(this);
        var postID = document.location.pathname.slice(3);
        $.ajax({
            type: 'GET',
            url: '/makeStar',
            data: {postID: postID},
            success: function(data) {
                $this.children('i').attr('class', 'glyphicon glyphicon-star');
                alert(data);
            }
        })
    })
    
    //点赞模块
    $('#thumb-like').one('click', function() {
        var $this = $(this);
        
        $this.attr('class', 'glyphicon glyphicon-heart');
       /* $.ajax({
            type: 'POST',
            url: '/giveLike',
            data: '',
            success: function(data) {
                
            }
        }) */
    })
    
    //上传图片模块
    $('#upload-img').on('click', function() {
        $('#choose-img').trigger('click'); 
    })
    
    $('#choose-img').on('change', function() {
        $('#submit-img').trigger('click'); 
    })
    
    $('#frameFile').on('load', function() {
        var path = $(this).contents().find('body').text().slice(6);
        var markdownPath = '\n![markdown]('+ path +')';
        $('#edit').append(markdownPath);
    })
    
    //启用模态框
    $('.active-login').click(function () {
        $('#login').modal();
        return false;
    })
    
    $('.active-reg').click(function () {
        $('#register').modal();
        return false;
    })
    
    //用于同个jQuery对象的不同事件操作
    $('body').on({
        click: function() {
            var speed = document.body.scrollTop > 400 ? 800 : 1200;
            $('body').animate({scrollTop: 0}, speed);
            return false;
        }
    }, '#back-top');
    

    $('#reg-account').on('blur', function() { 
        var account = 'name='+this.value+'';
        var $target = $('#reg-account');
        $.ajax({
            type: 'GET',
            url: '/hasAccount',
            data: account,
            success: function(isEmpty, textStatus) {
                if($target.val().length < 6) {
                    $target
                    .attr('data-original-title', '用户名需大于6位')
                    .trigger('mouseover');
                }
                else {  
                    if(isEmpty) {
                        $target
                        .attr('data-original-title', '该用户名可使用')
                        .trigger('mouseover');
                    }
                    else {
                        $target
                        .attr('data-original-title', '该用户名已存在')
                        .trigger('mouseover');
                   }
                }
             },
             error: function(XML, textStatus, error) {
                 console.log(XML + textStatus + error);
             }
        })
    })
    
    $('#log-account').on('blur', function() {
        var account = 'name='+this.value+'';
        var $target = $('#log-account').tooltip();
        $.ajax({
            type: 'GET',
            url: '/hasAccount',
            data: account,
            success: function(isEmpty, textStatus) {
                if(isEmpty) {
                    $target
                    .attr('data-original-title', '该用户不存在')
                    .trigger('mouseover');
                }
                else {
                    $target
                    .attr('data-original-title', '该用户可登录')
                    .trigger('mouseover');
                }
            }
        })
    })
    
    $('#post-remove').on('click', function(e) {
        var r = confirm("Are you sure to remove this post?");
        if(r == true) {}
        else {e.preventDefault()};
    })
})

