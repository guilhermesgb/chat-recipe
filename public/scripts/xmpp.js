var node = "/user/chat-room@topics.buddycloud.org/chat";

var _login = null;
var doLogin = function(jid, password){
    if ( null == jid || "" === jid.trim() ||
        null == password || "" === password.trim() ||
        null == _login ){
        console.error("Cannot login!");
        showLoginFailed();
        return;
    }
    _login(jid, password);
}

var _anonymousLogin = null;
var doAnonymousLogin = function(){
    if ( null == _anonymousLogin ){
        console.error("Cannot login anonymously!");
        return;
    }
    _anonymousLogin();
}

var _sendMessage = null;
var doSendMessage = function(message){
    if ( null == message || "" === message.trim() ||
        null == _sendMessage ){
        console.error("Cannot send message!");
        return;
    }
    _sendMessage(message);
}

$(window.document).ready(function() {

  var socket = new Primus('//' + window.document.location.host)
  //var socket = new Primus('https://xmpp-ftw.jit.su')
  //var socket = new Primus('https://xmpp-ftw.buddycloud.com')

  socket.on('error', function(error) { console.error(error) })

  var getNewMessagesNotification = function() {
      console.log("Will listen to notification of new messages");
      socket.on('xmpp.buddycloud.push.item', function(data) {
          console.log("New message arrived!", data);
          if ( node === data.node ){
              handleItem(data);
          }
      });
  }

  var subscribeToNode = function() {
      socket.send(
          'xmpp.buddycloud.subscribe',
          {
              "node": node,
          },
          function(error, data) {
          console.log('xmpp.buddycloud.subscribe response arrived');
          if (error) return console.error(error);
              console.log("Subscribed to Chat Room node");
          }
      )
  }

  var getNodeItems = function(itemId) {
      var data = {
        node: node,
        rsm: { max:5 } 
      }
      if (itemId) {
        data['id'] = itemId;
      }
      socket.send(
          'xmpp.buddycloud.retrieve',
          data,
          itemId ? doHandleItems(erase=false) : doHandleItems(erase=true)
      );
  }

  var registerToBuddycloudServer = function() {
      socket.send(
          'xmpp.buddycloud.register',
          {},
          function(error, data) {
              console.log('xmpp.buddycloud.register response arrived');
              if (error) return console.error(error)
                  console.log('Registered to Buddycloud server', data);
          }
      )
  }

  var sendPresenceToBuddycloudServer = function() {
      socket.send('xmpp.buddycloud.presence', {});
  }

  var createNode = function() {
      socket.send('xmpp.buddycloud.create',
      {
          node : node,
          options: [
              { "var": "buddycloud#channel_type", value : "topic" },
              { "var": "pubsub#title", value : "Chat Topic Channel" },
              { "var": "pubsub#access_model", value : "open" },
              { "var": "buddycloud#default_affiliation", value : "publisher" }
          ]
      },
      function(error, data) {
          console.log('xmpp.buddycloud.create response arrived');
          if (!error){
              console.log('Created Chat Room node', data);
          }
          else if ("cancel" === error.type &&
                   "conflict" === error.condition){
              subscribeToNode();
          }
          else {
              console.error(error);
          }
          getNewMessagesNotification();
          sendPresenceToBuddycloudServer();
      });
  }

  var discoverBuddycloudServer = function() {
      socket.send(
          'xmpp.buddycloud.discover',
          { server: 'channels.buddycloud.org' },
          /* {},*/
          function(error, data) {
              console.log('xmpp.buddycloud.discover response arrived');
              if (error) return console.error(error);
              console.log('Discovered Buddycloud server at', data);
              //registerToBuddycloudServer();
              createNode();
              getNodeItems();
              _sendMessage = function(message) {
                  socket.send(
                      'xmpp.buddycloud.publish',
                      {
                          "node": node,
                          "content": {
                                      "atom": {
                                           "content": message
                                      }
                          }
                      },
                      function(error, data) {
                          console.log('xmpp.buddycloud.publish response arrived');
                          if (error) console.error(error);
                          else {
                              console.log("Message sent.");
                              //getNodeItems(data.id);
                          }
                      }
                  );
              }
          }
      )
  }

  socket.on('open', function() {
      console.log('Connected');
      _login = function(jid, password) {
          socket.send(
              'xmpp.login',
              {
                  jid: jid,
                  password: password
              }
          );
      };
      _anonymousLogin = function(){
          socket.send(
              'xmpp.login.anonymous',
              {
                  jid: '@anon.buddycloud.org'
              }
          );
      };
  });

  socket.on('xmpp.connection', function(data) {
     console.log('Connected as', data.jid);
     discoverBuddycloudServer();
     showMessageForm();
     hideLoginForm();
  });

  socket.on('timeout', function(reason) {
      console.error('Connection failed: ' + reason)
  })

  socket.on('end', function() {
      console.log('Socket connection closed')
      socket = null
  })
  
  socket.on('xmpp.error', function(error) {
      console.error('XMPP-FTW error', error);
      if ("\"XMPP authentication failure\"" === error.description){
          window.alert('Could not authenticate!');
          showLoginFailed();
      }
  })
  
  socket.on('xmpp.error.client', function(error) {
      console.error('XMPP-FTW client error', error)
  })
})
