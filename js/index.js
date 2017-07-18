(function($){
  $.fn.extend({
    color: function(options) {
      var defaults = {color:'blue', size: "30px"};
      options = $.extend({}, defaults, options);
      return $(this).each(function(){
        $(this).css({
          color: options.color,
          fontSize: options.size
        });
      })
    },
  })
})(window.jQuery)
