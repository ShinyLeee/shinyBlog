
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

$(function(){
    $('#user-hide, #hide-user').on('click', function() {
        $('#user').animate({height: 0, opacity: 'hide'}, 800, 'linear', function() {
            $('#hide-user').text('显示用户栏').attr('id', 'show-user');
            $('.locatePage').css('left', '10%');
        });
    })
    
    $('#show-user, #show-users').on('click', function() {
        $('.locatePage').css('left', '40%');
        $('#user').animate({height: '481px', opacity: 'show'}, 800, 'linear', function() {
            $('#hide-user').text('隐藏用户栏').attr('id', 'hide-user');
        });
    })

    $('.activeLogin').click(function () {
        $('#login').modal();
    })
    $('.activeReg').click(function () {
        $('#register').modal();
    })
    
});