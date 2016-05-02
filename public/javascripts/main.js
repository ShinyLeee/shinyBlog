


$(function(){
    $('[data-toggle="tooltip"]').tooltip();
    
    //获取当前文章数量
    $(window).on('load', function() {
        var user = $('#user').find('.info').children('a').text();
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
        $.ajax({
            type: 'GET',
            url: '/preview',
            data: {article: article},
            success: function(article) {
                $('#preview').html(article);
            },
            error: function(XML, textStatus, err) {
                console.log(XML + textStatus + err);
            }
        })
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
})

//Learn Collapse Plugin From Bootstrap
!function($) {
    var collapse = function(target, option) {
        this.$target = $(target);
        this.$trigger = $('[data-toggle = "collapses"][data-target = "#'+target.id+'"]');
        this.option = option;
        
        if (this.option.toggle == "collapses") this.toggle();  
    }
    
    collapse.prototype.toggle = function() {
        this[this.$target.hasClass('in') ? 'hide' : 'show'](); 
    }
    
    collapse.prototype.show = function() {
        if (this.$target.hasClass('in')) return;
        
        var startEvent = $.Event('show.sl.collapse');
        this.$target.trigger(startEvent);
        
        this.$trigger
        .removeClass('collapsed')
        .attr('aria-expanded', true);
        
        this.$target
        .removeClass('collapse')    //去除collapse则显示，但将高度设为0依旧不显示
        .addClass('collapsing')
        .attr('aria-expanded', true)
        .height(0);
        
        this.transitioning = 1;
        
        var complete = function() {
            this.$target
            .removeClass('collapsing')
            .addClass('collapse in') //css-->.collapse --> db: hide; .collpase . in --> db: block;
            .height('');
            
            this.transitioning = 0;
            this.$target.trigger('shown.sl.collapse');
        }
        
        if (!$.support.transition) return complete.call(this);
        
        this.$target
        .height(this.$target[0].scrollHeight)
        .one('bsTransitionEnd', $.proxy(complete, this));
    }
    
    collapse.prototype.hide = function() {
        if (!this.$target.hasClass('in')) return;
        
        var startEvent = $.Event('hide.sl.collapse');
        this.$target.trigger(startEvent);
        
        this.$trigger
        .addClass('collapsed')
        .attr('aria-expanded', false);
        
        this.$target.height(this.$target[0].scrollHeight);
        
        this.$target
        .removeClass('collapse in')   
        .addClass('collapsing')
        .attr('aria-expanded', false);
        
        this.transitioning = 1;
        
        var complete = function() {
            this.$target
            .removeClass('collapsing')
            .addClass('collapse')
            .height(0);
            
            this.transitioning = 0;
            this.$target.trigger('hiden.sl.collapse');
        }
        
        if (!$.support.transition) return complete.call(this);
        this.$target
        .height(0)
        .one('bsTransitionEnd', $.proxy(complete, this))
        .emulateTransitionEnd(350);
    }
    
    //构造器
    function Plugin(option) {
        return this.each(function(index) {
            var $target = $(this);
            var data = $target.data('sl.collapse');
            
            if (!data) $target.data('sl.collapse', new collapse(this, option));
            if (typeof option == 'string') data[option]();
        })
    }
    
    $(document).on('click.sl.collapse.data-api', '[data-toggle = "collapses"]', function(e) {
        var $trigger = $(this);
        var $target = $($trigger.data('target'));
        var data = $target.data('sl.collapse');
        var option = data ? 'toggle' : $trigger.data();
        
        Plugin.call($target, option);
        
    })
    
}(jQuery)