$(document).ready(function() {
  $('#btnLogin').click(function () {
      if ( $('#anonymousCheckbox').is(':checked') ){
          doAnonymousLogin();
      }
      else{
          doLogin($('#inputJid').val(), $('#inputPassword').val());
      }
      $('#btnLogin').text("Please wait...");
  });

  $('#btnRegister').click(function () {
      var confirmPassword = $('#inputConfirmPassword').val(); 
      if ( $('#inputRegisterPassword').val() == confirmPassword ){
          doRegisterUser($('#inputUsername').val(), confirmPassword);
      }
      else {
          window.alert("Password on both fields must match!");
      }
  });

  $('#btnSendMessage').click(function () {
  	doSendMessage($('#inputMessage').val());
        $('#inputMessage').val("");
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

  $('#toggleRegistrationForm').click(function(){
      $('#registrationForm').toggle("slow");
      $('#loginForm').toggle("slow");
  });

});

var showMessageForm = function() {
  $('#messageForm').toggle(true, "slow");
};

var hideLoginForm = function() {
  $('#btnLogin').text("Login");
  $('#loginForm').toggle(false, "slow");
  $('#toggleRegistrationForm').toggle(false, "slow");
}

var showLoginFailed = function() {
  $('#btnLogin').text("Login");
}

var handleItem = function(item) {
  var content = "<li class=\"list-group-item\"><span " +  
      "class=\"badge pull-left\">" + item.entry.atom.author.name + 
      "</span><br><h4>" + item.entry.atom.content.content + "</h4></li>";
  $('.list-group').append(content);
  if ($('.list-group-item').length > 5){
      $('.list-group li').first().remove();
  }
};

var handleItems = function(error, items) {
  items.reverse().forEach(function(item) {
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
