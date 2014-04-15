var jid, password;

var sendMessage = function(message) {
      socket.send(
          'xmpp.buddycloud.publish',
	  {
	      "node": "/user/chatrecipe@topics.buddycloud.org/chat",
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
               }
          }
      )
  }


$(window.document).ready(function() {

  //var socket = new Primus('//' + window.document.location.host)
  var socket = new Primus('https://xmpp-ftw.jit.su')

  socket.on('error', function(error) { console.error(error) })

  var handleItem = function(item) {
          content = '<li>'
          content += item.entry.atom.content.content
          content += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;by '
          content += item.entry.atom.author.name
          content += '</li>'
          $('ul.posts').append(content)
  }

  var handleItems = function(error, items) {
      if (error) return console.error(error)
      $('ul.posts').empty()
      var content
      items.forEach(handleItem)
  }

  var getNewMessagesNotification = function() {
      console.log("Will listen to notification of new messages");
      socket.on('xmpp.buddycloud.push.item', function(data) {
	  console.log("New message arrived!");
          if ( "/user/chatrecipe@topics.buddycloud.org/chat" === data.node ){
	      handleItem(data.item);
	  }
      });
  }

  var subscribeToNode = function() {
      socket.send(
          'xmpp.buddycloud.subscribe',
          {
	      "node": "/user/chatrecipe@topics.buddycloud.org/chat",
          },
          function(error, data) {
	      console.log('xmpp.buddycloud.subscribe response arrived');
	      if (error) return console.error(error);
	      console.log("Subscribed to ChatRecipe node");
	      getNewMessagesNotification();
	  }
      )
  }

  var getNodeItems = function() {
      socket.send(
          'xmpp.buddycloud.retrieve',
          {
	      "node": "/user/chatrecipe@topics.buddycloud.org/chat",
              rsm: { max:5 } 
          },
	  handleItems
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
              node : "/user/chatrecipe@topics.buddycloud.org/chat",
	      options: [
		{ "var": "buddycloud#channel_type", value : "topic" },
		{ "var": "pubsub#title", value : "Chat Topic Channel" },
		{ "var": "pubsub#access_model", value : "open" }
	      ]
          },
	  function(error, data) {
	       console.log('xmpp.buddycloud.create response arrived');
	       if (!error){
                   console.log('Created ChatRecipe node', data);
	       }
	       else if ("cancel" === error.type &&
                        "conflict" === error.condition){
		   subscribeToNode();
               }
	       else {
	           console.error(error);
               }
	       sendPresenceToBuddycloudServer();
          }
      )
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
          }
      )
  }

  var login = function(jid, password) {
      socket.send(
          'xmpp.login',
          {
              jid: jid,
              password: password
	  }
      )
      socket.on('xmpp.connection', function(data) {
          console.log('Connected as', data.jid)
          discoverBuddycloudServer()
      });
  }

  socket.on('open', function() {
      console.log('Connected');
      /*login(jid, password);*/
      doLogin = function(){
	  if ( null == jid || "" == jid ||
               null == password || "" == password ){
	      console.error("Cannot login!");
	      return;
          }
          login(jid, password);
      }
  })

  socket.on('timeout', function(reason) {
      console.error('Connection failed: ' + reason)
  })

  socket.on('end', function() {
      console.log('Socket connection closed')
      socket = null
  })
  
  socket.on('xmpp.error', function(error) {
      console.error('XMPP-FTW error', error)
  })
  
  socket.on('xmpp.error.client', function(error) {
      console.error('XMPP-FTW client error', error)
  })
})
