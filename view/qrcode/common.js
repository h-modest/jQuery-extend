config = {
  api_url: 'http://s.weile.com/',
}

function ajax(url, param, type) {
  // 利用了jquery延迟对象回调的方式对ajax封装，使用done()，fail()，always()等方法进行链式回调操作
  // 如果需要的参数更多，比如有跨域dataType需要设置为'jsonp'等等，可以考虑参数设置为对象
  return $.ajax({
    url: url,
    data: param || {},
    type: type || 'GET',
  });
}

function pageNext($this, url, isHandle, in_field, setpUrl) {
  ajax(url).done(function(res){
    var result = JSON.parse(res);
    if (result.error == 'ok') {
      var formData = result.data.data[0];
      var field = [];
      if (in_field) {
        field = in_field;
      } else {
        for (var recode in formData) {
          field.push(recode);
        }
      }
      FillTable($this, result.data.data, field, isHandle, setpUrl);
    }
  })
}

function pagination($this, current, page, pagesize, totalpage, url, isHandle = false, field, setpUrl) {
  var disabled = pagesize > current ? '' : 'disabled';
  var html = '<div class="pagination">页<span class="page page-pre disabled"></span>' +
             '<input type="type" value="'+ current +'" class="page-input" />' +
             '<span class="page page-next '+ disabled +'"></span><span class="num">/</span>' + pagesize + '' +
             '<span class="gap">|</span>显示<span class="num">'+ page +'</span>条记录' +
             '<span class="gap">|</span>共有<span class="num">'+ totalpage + '</span>条记录' +
             '</div>';
  if (typeof $this.find('.pagination') === 'undefined') {
    $this.append(html);
  } else {
    $this.find('.pagination').remove();
    $this.append(html);
  }

  $pagination = $this.find('.pagination');
  $page = $pagination.find('.page');
  $page.click(function(){
    $_self = $(this);
    if (!$_self.hasClass('disabled')) {
      $pageInput = $_self.parents('.pagination').find('.page-input');
      $page_btn = $_self.parents('.pagination').find('.page');
      var pageNum = parseInt($pageInput.val());
      var index = $_self.index();
      if (index) {
        if (pageNum-1 <= pagesize) {
          pageNum++;
          url+='&p=' + pageNum;
          pageNext($this, url, isHandle, field, setpUrl);
          $pageInput.val(pageNum);
          $page_btn.addClass('disabled').eq(0).removeClass('disabled');
          if (pageNum < pagesize ) {
            setTimeout(function(){
              $page_btn.eq(1).removeClass('disabled');
            },500);
          }
        }
      } else {
        if (pageNum > 1) {
          pageNum--;
          url+='&p=' + pageNum;
          pageNext($this, url, isHandle, field, setpUrl);
          $pageInput.val(pageNum);
          $page_btn.addClass('disabled').eq(1).removeClass('disabled');
          if (pageNum > 1 ) {
            setTimeout(function(){
              $page_btn.eq(0).removeClass('disabled');
            },500);
          }
        }
      }
    }
  });

  $input = $pagination.find('.page-input');
  var original = 1;
  $input.focus(function(){
    original = $(this).val();
  });
  var inputPage = function($__self) {
    var page_input = parseInt($_self.val());
    if (page_input > 0 && page_input <= pagesize && original != page_input) {
      url+='&p=' + page_input;
      pageNext($this, url, isHandle, field, setpUrl);
      if (pagesize > 1) {
        $page_btn = $_self.parents('.pagination').find('.page');
        if (page_input == pagesize) {
          $page_btn.addClass('disabled').eq(0).removeClass('disabled');
        } else if ( page_input == 1 ) {
          $page_btn.addClass('disabled').eq(1).removeClass('disabled');
        }
      }
    } else {
      $__self.val(original);
    }
  }
  $input.blur(function(event){
      inputPage($(this));
  });
  $input.keypress(function(event){
    $_self = $(this);
    if (event.keyCode == 13) {
      inputPage($_self);
      $_self.blur();
    }
  })
}

function FillTable($this, data, field, isHandle = false, url, changeUrl) {
  var html = '';
  if (data.length) {
    data.map(function(k,i){
      var index = i + 1;
      html+='<tr><td>' + index + '</td>';
      field.map(function(val){
        html+='<td>' + k[val] + '</td>';
      });
      if (isHandle) {
        var disabled = parseInt(k.status) ? '启用' : '禁用';
        html+='<td><span class="handle handle-detail" data-id="'+ k.id +'" data-status="' + k.status + '">查看详情</span>' +
              '<span class="handle handle-switch" data-id="'+ k.id +'" data-status="' + k.status + '">'+disabled+'</span></td>'
      }
      html+='</tr>';
    });
  } else {
    html+='<tr class="no-data"><td colspan="4">暂无数据</td></tr>';
  }
  $this.find('tbody').html('').html(html);

  if(isHandle) {
    $handle = $this.find('.handle');
    $handle.click(function(){
      $_self = $(this);
      var id = parseInt($_self.attr('data-id'));
      var status = parseInt($_self.attr('data-status'));
      if ($_self.index()) {
        var text = $_self.html() === '禁用' ? '启用' : '禁用';
        $('body').modal({
          msg: '是否' + $_self.html() + '该链接', isBtn: true,
          isBtnCancel: true,
          comfirm: function() {
            var status = status === 1 ? 0 : 1;
            ajax(changeUrl + '?id=' + id + '&status=' + status).done(function(res){
              var result = JSON.parse(res);
              if (result.error == 'ok') {
                $('body').modal({msg: result.message});
              }
              $_self.html(text);
              $_self.parents('td').find('.handle').attr('data-status', status);
            });
          }
        });
      } else {
        if (status) {
          $('body').modal({
            msg: '该链接已失效!',
          })
        } else {
          ajax(url + '?id=' + id).done(function(res){
            var result = JSON.parse(res);
            var output = result.data;
            var out = [];
            var qrcodeData = data.filter(function(val) {
              return val.id == id;
            })[0];
            var list = {
              header: {
                date: '日期',
                count: '访问量',
              },
              body: output,
            };
            $('body').modal({
              width: 600,
              height: 320,
              img: config.api_url + qrcodeData.qrcodeurl,
              imgTitle: '链接名: ' + qrcodeData.name,
              imgContent: '链接: ' + qrcodeData.url,
              list: list,
              listUrl: url + '?id=' + id,
            })
            // console.log(output.data);
          })
        }
      }
    })
  }
}
