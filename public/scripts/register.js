var apiLocation = "https://demo.buddycloud.org/api";

var _registerUser = null;
var doRegisterUser = function(username, password) {
    if ( null == username || "" === username.trim() ||
        null == password || "" === password.trim() ||
        null == _registerUser ){
        window.alert("Cannot register user!");
        return;
    }
    _registerUser(username, password);
}

$(window.document).ready(function() {

  _registerUser = function(username, password) {
      var jid = username + "@buddycloud.org";
      $.ajax({
          type: "POST",
          url: apiLocation + "/account",
          contentType: "application/json",
          processData: true,
          data: "{\"username\": \""+jid+"\", \"password\": \""+password+"\", \"email\": \"email@email.com\"}",
          success: function(data) {
              window.alert(jid + " registered successfully!");
              $("#toggleRegistrationForm").click();
          },
          error: function(jqXHR) {
              $.ajax({
                   type: "GET",
                   url: apiLocation + "/" + jid + "/metadata/posts",
                   success: function(data) {
                       window.alert(jid + " already exists!");
                   },
                   error: function(jqXHR) {
                       window.alert("Problem trying to register user!");
                   }
              }); 
          }
      });
  }
});
