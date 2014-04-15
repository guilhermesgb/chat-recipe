$(document).ready(function() {
  $('#btnLogin').click(function () {
  	doLogin($('#inputJid').val(), $('#inputPassword').val());
  });

  $('#btnSendMessage').click(function () {
  	doSendMessage($('#inputMessage').val());
  });

  $('.list-group').empty();
});

var handleItem = function(item) {
  var content = "<li class=\"list-group-item\"><span " +  
      "class=\"badge pull-left\">" + item.entry.atom.author.name + 
      "</span><br><h4>" + item.entry.atom.content.content + "</h4></li>";
  $('.list-group').append(content);
};

var handleItems = function(error, items) {
  items.forEach(function(item) {
    handleItem(item);
  });
};