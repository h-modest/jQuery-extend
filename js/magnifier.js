(function($){
  $.fn.extend({
    magnifier: function(options) {
      var defaults = {
        _width: 400,  //小图窗口宽
        _height: 400, //小图窗口高
        width: 400,  //大图窗口宽
        height: 400, //大图窗口宽
        offset: 10, //大图窗口离小图距离
        mprefix: 'X', //大图小图区分命名
      };
      var _ = $(this);
      var self = this;
      var mLeft = _.offset().left;
      var mTop = _.offset().top;
      options = $.extend({}, defaults, options);
      $img = _.find('img');
      var originUrl = $img.eq(0).attr('src');
      var expand = self.imageJoin(originUrl, options.mprefix);
      var expand_pos = options.offset + options._width;
      var html = '<div class="zoom-origin"><span class="zoom"></span></div>';
      html += '<div class="zoom-expand hide" style="background-image: url('+ expand +'); left: '+ expand_pos +'px"></div>';
      html += '<div class="zoom-list" style="width: '+options._width+'px"><span class="zoom-btn pre disabled"></span><div class="list"><dl>';
      $img.each(function(){
        html +='<dd><img src="'+$(this).attr('src')+'" /></dd>';
      });
      html+='</dl></div><span class="zoom-btn next disabled"></span></div>';
      _.html('').append(html);
      $zoom = _.find('.zoom-origin');
      $expand = _.find('.zoom-expand');
      $zoom.prepend($img.eq(0));
      $zoom.css({ width: options._width, height: options._height });
      $expand.css({ width: options.width, height: options.height });

      var fetchImage = function(imagePre) {
        var catchImage = new Image();
        catchImage.src = imagePre;
        catchImage.addEventListener('load', function(){
          var largeWidth = this.width;
          var largeHeight = this.height;
          var vscale = options._width/largeWidth;
          var hscale = options._height/largeHeight;
          options = $.extend(options, {
            mwidth: vscale*options._width,
            mheight: hscale*options._height,
            lwidth: largeWidth,
            lheight: largeHeight,
          });
        });
      }

      fetchImage(expand);

      var fetchCeil = function(size, name, total) {
        var maxSize = options['l'+name] - options[name];
        return -Math.floor(size*maxSize/total*100)/100;
      }

      var fetchZoom = function(a, b, c, d) {
        var total = a-b-c-options['m'+d]/2;
        return Math.floor(total*100)/100;
      }

      var zoomMove = function(step, limit) {
        if (step<0) {
          step = 0;
        } else if(step>limit) {
          step = limit;
        }
        return step;
      }

      //放大镜移动
      $zoom.mousemove(function(event) {
        var zLeft, zTop, _left, _top, left, top, gapWidth, gapHeight;
        zLeft = event.clientX;
        zTop = event.clientY;
        _left = $zoom.outerWidth() - $zoom.innerWidth(); //jQyery 获取clientX
        _top = $zoom.outerHeight() - $zoom.innerHeight();
        left = fetchZoom(zLeft, mLeft, _left, 'width');
        top = fetchZoom(zTop, mTop, _top, 'height');
        gapWidth = options._width - options.mwidth;
        gapHeight = options._height - options.mheight;
        left = zoomMove(left, gapWidth);
        top = zoomMove(top, gapHeight);
        vleft = fetchCeil(left, 'width', gapWidth);
        vtop = fetchCeil(top, 'height', gapHeight);
        $zoom.find('.zoom').css({
          width: options.mwidth,
          height: options.mheight,
          top: top,
          left: left,
        });
        $expand.css({'background-position': ""+ vleft+"px "+vtop+"px"}).removeClass('hide');
      });

      //鼠标离开放大镜区域
      $zoom.mouseleave(function() {
        $expand.addClass('hide');
        $zoom.find('.zoom').removeAttr("style");
      });

      //缩略图列表切换
      $zoomList = _.find('.zoom-list');
      $zoomBtn = $zoomList.find('.zoom-btn');
      $sublist = $zoomList.find('.list dl');
      var step = $img.length - 6;
      var maxStep = step;
      if (step > 0) {
        $zoomList.find('.next').removeClass('disabled');
        $zoomBtn.each(function(i, k){
          $self = $(this);
          $self.click(function(){
            $btn = $(this);
            if (!$btn.hasClass('disabled')) {
              var _left = parseInt($sublist.css('left'));
              if (i) {
                if (step > 0) {
                  $sublist.css('left', _left - 58 + 'px');
                  $zoomList.find('.pre').removeClass('disabled');
                  $btn.addClass('disabled');
                  step--;
                  if (step) {
                    setTimeout(function(){
                      $btn.removeClass('disabled');
                    }, 500);
                  }
                }
              } else {
                if (step < maxStep) {
                  $sublist.css('left', _left + 58 + 'px');
                  step++;
                  $zoomList.find('.next').removeClass('disabled');
                  $btn.addClass('disabled');
                  if (step < maxStep) {
                    setTimeout(function(){
                      $btn.removeClass('disabled');
                    }, 500);
                  }
                }
              }
            }
          })
        })
      }

      //缩略图点击切换
      $sublist.find('dd').click(function(){
        $self = $(this);
        var imagePre = $self.find('img').attr('src');
        var enlargePre = self.imageJoin(imagePre, options.mprefix);
        $zoom.find('img').attr('src', imagePre);
        $expand.css('background-image', 'url('+enlargePre+')');
        fetchImage(enlargePre);
      });
    },
    imageJoin: function(url, prefix) {
      var src = url.split('_');
      src[1] = prefix + src[1];
      return src.join('_');
    }
  })
})(window.jQuery)
