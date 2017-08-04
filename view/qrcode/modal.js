(function($){
  $.fn.extend({
    modal: function(options) {
      var defaults = {
        title: '',
        msg: '提醒内容',
        img: '',
        imgTitle: '',
        imgContent: '',
        list: {},
        width: 260,
        height: 100,
        direct: 'top',
        offset: 50,
        time: 400,
        disTime: 1500,
        isBtn: false,
        isBtnCancel: false,
        listUrl: '',
        zIndex: 0,
        comfirm: null,
      };

      options = $.extend({}, defaults, options);

      var TITLE = options.title;
      var MSG = options.msg;
      var WIDTH = options.width;
      var HEIGHT = options.height;
      var DIRECT = options.direct;
      var TIME = options.time;
      var ISBTN = options.isBtn;
      var ISBTNCANCEL = options.isBtnCancel;
      var OFFSET = options.offset;
      var DISTIME = options.disTime;
      var IMG = options.img;
      var IMGTITLE = options.imgTitle;
      var IMGCONTENT = options.imgContent;
      var LIST = options.list;
      var LISTURL = options.listUrl;
      var ZINDEX = options.zIndex;

      $that = $(this);
      var html = '<div class="modal"><div class="modal-shadow"></div><div class="modal-group">' +
                '<div class="modal-detail">';
      if (!!TITLE) {
        html+='<p class="modal-title">'+ TITLE +'</p>';
      }
      if (!!IMG && !!LIST) {
        html+= '<div class="modal-content"><div class="modal-img"><img src="'+IMG+'" />' +
               '<div class="modal-img-content"><p class="modal-img-tilte">'+ IMGTITLE +'</p>' +
               '<p>' + IMGCONTENT + '</p></div></div>';
        html+= '<div class="modal-date"><span class="modal-time">起始时间：<input type="date" placeholder="起始时间" name="date_from" /></span>-' +
               '<span class="modal-time">截止时间：<input type="date"  name="date_to" placeholder="截止时间" /></span>' +
               '<span class="modal-date-btn">搜索</span></div>';
        html+= '<table><thead><th>序列号</th>';
        var item = [];
        for (var key in LIST.header) {
          html+='<th colspan="1">'+ LIST.header[key] +'</th>';
          item.push(key);
        };
        html+='</thead><tbody>';
        var hlength = item.length+1;
        var blength = LIST.body.data.length;
        if (blength) {
          LIST.body.data.map(function(k,i){
            var step = i + 1;
            html+='<tr><td>' + step + '</td>';
            item.map(function(values){
              html+='<td>'+k[values]+'</td>';
            });
            html+='</tr>';
          })
        } else {
          html+='<tr class="no-data"><td colspan="' + hlength +'">暂无数据</td></tr>';
        }
        html+='</tbody></table></div>';
      } else {
        html+= '<p class="modal-content">'+MSG+'</p>';
      }
      html+='</div>';
      if (ISBTN) {
        html+='<div class="modal-btn-group">';
        if (ISBTNCANCEL) {
          html+= '<span class="modal-btn modal-btn-cancel">取消</span>';
        }
        html+= '<span class="modal-btn modal-btn-comfirm">确定</span>';
        html+='</div>';
      }
      html+= '</div></div>';

      $that.append(html);
      var modal_num = $that.find('.modal').length-1;
      $modal = $that.find('.modal').eq(modal_num);
      $that.addClass('modal-in');
      $group = $modal.find('.modal-group');
      $group.css({ 'min-width': WIDTH + 'px', 'min-height': HEIGHT + 'px', top: -HEIGHT + 'px', left: '50%', transform: 'translateX(-50%)' });
      $group.animate({
        top: OFFSET +'px',
      },TIME);
      if (!TITLE && !IMG) {
        $group.find('.modal-content').css('line-height', HEIGHT + 'px');
      }

      if (!!IMG) {
        pagination($group, LIST.body.p, LIST.body.page_rows, LIST.body.page_total, LIST.body.data_total, LISTURL)
      }

      if (!!ZINDEX) {
        var lastest_length = $modal.length;
        $modal.eq(lastest_length).css('z-index', ZINDEX).find('.modal-shadow').css('z-index', ZINDEX+100);
        $group.eq(lastest_length).css('z-index', ZINDEX+200);
      }

      var removeModal = function($_that) {
        var modal_length = $_that.length;
        if (modal_length>1) {
          $_that.eq(modal_length-1).remove();
        } else {
          $that.removeClass('modal-in');
          $_that.remove();
        }
      }

      var keyup = function(event){
        if (event.keyCode == 27) {
          $_that = $that.find('.modal');
          if ($_that.length == 1) {
            window.removeEventListener('keyup', keyup);
          }
          removeModal($_that);
        }
      };

      if (!modal_num) {
        window.addEventListener('keyup', keyup);
      }

      $modal.find('.modal-shadow').click(function(){
        $_that = $that.find('.modal');
        removeModal($_that);
        if ($_that.length === 1) {
          window.removeEventListener('keyup', keyup);
        }
      });

      $modal.find('.modal-btn-group .modal-btn').click(function(){
        $_that = $(this);
        if ($_that.index()) {
          $.isFunction(options.comfirm) && options.comfirm.call();
        } else {
          removeModal($that.find('.modal'));
        }
      })

      $date = $modal.find('.modal-date');
      $date.find('.modal-date-btn').click(function(){
        $input = $date.find('input');
        var form = {};
        $input.each(function(){
          $__self = $(this);
          var name = $__self.attr('name');
          var val = $__self.val();
          form[name] = val;
        });
        if (!form.date_from || !form.date_to) {
          $('body').modal({
            msg: '起始时间/截止时间不能为空！',
            zIndex: 1420,
            offset: 200
          })
          return false;
        }
        ajax(LISTURL+ '&date_from=' + form.date_from + '&date_to=' + form.date_to).done(function(res){
          var result = JSON.parse(res);
          if (result.error == 'ok') {
            FillTable($modal, result.data.data, ['count', 'date']);
            pagination($group, result.data.p, result.data.page_rows, result.data.page_total, result.data.data_total, LISTURL);
          }
        })
      });
    },
  })
})(jQuery)
