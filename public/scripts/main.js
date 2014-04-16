$(document).ready(function() {
  $('#btnLogin').click(function () {
      if ( $('#anonymousCheckbox').is(':checked') ){
          doAnonymousLogin();
      }
      else{
          doLogin($('#inputJid').val(), $('#inputPassword').val());
      }
  });

  $('#btnSendMessage').click(function () {
  	doSendMessage($('#inputMessage').val());
        $('#inputMessage').empty();
  });

  $('.list-group').empty();

  $('#anonymousCheckbox').on('change', function(){
      if ( this.checked ){
          $('#inputJid').prop('disabled', true);
          $('#inputPassword').prop('disabled', true);
      }
      else {
          $('#inputJid').prop('disabled', false);
          $('#inputPassword').prop('disabled', false);
      }
  });

});

var handleItem = function(item) {
  console.log(item);
  var content = "<li class=\"list-group-item\"><span " +  
      "class=\"badge pull-left\">" + item.entry.atom.author.name + 
      "</span><br><h4>" + item.entry.atom.content.content + "</h4></li>";
  $('.list-group').append(content);
};

var handleItems = function(error, items) {
  items.reverse().forEach(function(item) {
    console.log(item);
    handleItem(item);
  });
};

var doHandleItems = function(erase) {
  if (erase) {
      return function(error, items) {
          $('.list-group').empty();
          handleItems(error, items);
      }
  }
  return function(error, items) {
      handleItems(error, items);
  }
}
