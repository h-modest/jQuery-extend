(function($){
  $.fn.extend({
    carousel: function(options) {
      var defaults = {
        width: 300,
        height: 300,
        iswitch: true, //原点按钮组开关
        idirect: 'bottom', //原点按钮组方向
        ioffset: 10, //原点按钮组距离底框距离
        bswitch: true, //水平切换按钮组开关
        bdirect: 'horizontal', //左右翻页按钮方向
        isTimer: false, //是否开启定时切换
        time: 1000 //计时数
      };

      options = $.extend({}, defaults, options);

      $_ = $(this);
      $img = $_.find('img');
      var name = options.idirect;
      var bdirect = options.bdirect;
      var N_DIRECT = name == 'left' || name == 'right' || bdirect == 'vertical';
      var timer;

      $_.css({ width: options.width + 'px', height: options.height + 'px' });
      var html = '<ul class="list">'
      $img.each(function(){
        $self = $(this);
        html+='<li style="height: '+options.height+'px"><img src="'+$self.attr('src')+'" style="width: '+ options.width+'px; height: '+ options.height +'px" /></li>'
      });
      html+='</ul>';

      if (options.iswitch) {
        html+='<dl class="point">';
        $img.each(function(i) {
          if(!i) {
            html+='<dd class="hover"></dd>';
          } else {
            html+='<dd></dd>';
          }
        });
        html+='</dl>';
      }

      if (options.bswitch) {
        html+= '<div class="group"><span class="carousel-btn pre"></span><span class="carousel-btn next"></span></div>';
      }
      $_.html('').html(html);
      $list = $_.find('.list');
      var firstImg = $list.find('li').first().clone();
      var length = $list.find('li').length + 1;
      var i= 0, key = 1;
      $list.append(firstImg);

      if (N_DIRECT) {
        $list.height(length*options.height);
      } else {
        $list.width(length*options.width);
      }

      $group = $_.find('.group');
      $point = $_.find('.point').find('dd');

      if (bdirect == 'horizontal') {
        $group.find('.carousel-btn').css({top: '50%', transform: 'translateY(-50%)'});
        $group.find('.next').css({right: 0});
        $group.append("<style>.pre::after{transform: rotate(-135deg); margin-left: 5px}.next::after{transform: rotate(45deg); margin-right: 5px}</style>");
      } else {
        $group.find('.carousel-btn').css({left: '50%', transform: 'translateX(-50%)'});
        $group.find('.next').css({bottom: 0});
        $group.append("<style>.pre::after{transform: rotate(-45deg); margin-top: 16px}.next::after{transform: rotate(135deg); margin-bottom: 2px}</style>");
      }

      var imageMove = function($self) {
        var style = {}, dir = 'left', size='width';
        if (N_DIRECT) {
          dir = 'top';
          size = 'height';
        }
        if (i == length) {
          i = 1;
          style[dir] = 0;
          $list.css(style);
        }
        if (i == -1) {
          i = length - 2;
          style[dir] = (length - 1)*-options[size];
          $list.css(style);
        }
        key = 0;
        if ($self) {
          $self.addClass('disabled');
        }
        style[dir] = i*-options[size];
        $list.stop().animate(style,400,function(){
          key = 1;
          if ($self) {
            $self.removeClass('disabled');
          }
        });

        var p = 0;
        if (i<length-1) {
          p = i;
        }
        $point.eq(p).addClass('hover').siblings().removeClass('hover');
      }

      if(options.isTimer) {
        var autoPlay = function(){
          timer = setInterval(function(){
            i++;
            imageMove();
          },options.time);
        }
        autoPlay();
      }


      var pointPresent = function() {
        var style = {};
        style[name]=options.ioffset + 'px';
        if (name == 'top' || name == 'bottom') {
          style = $.extend(style, { width: '100%', height: '10px'});
        } else {
          style = $.extend(style, { width: '10px', top: '50%', transform: 'translateY(-50%)' })
        }
        $_.find('.point').css(style);
      }

      if (options.bswitch) {
        //移动到目的地
        $_.mouseover(function(){
          $group.find('.carousel-btn').show();
          if (timer) {
            clearInterval(timer);
          }
        });
        $_.mouseleave(function(){
          $group.find('.carousel-btn').hide();
          if (timer) {
            autoPlay();
          }
        });
        //左右切换点击
        $group.find('.pre').click(function() {
          if (key) {
            i--;
            imageMove($(this));
          }
        });
        $group.find('.next').click(function() {
          if (key) {
            i++;
            imageMove($(this));
          }
        });
      }

      if (options.iswitch) {
        pointPresent();
        $point.click(function(){
          if (key) {
            $self = $(this);
            i = $self.index();
            imageMove($self);
          }
        });
      }
    },
  })
})(jQuery)
