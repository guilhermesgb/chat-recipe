$(window.document).ready(function() {

  //var socket = new Primus('//' + window.document.location.host)
  var socket = new Primus('https://xmpp-ftw.jit.su')

  socket.on('error', function(error) { console.error(error) })

  var handleItems = function(error, items) {
      console.log("handle items started");
      if (error) return console.error(error)
      $('ul.posts').empty()
      var content
      items.forEach(function(item) {
          content = '<li>'
          content += item.entry.atom.content.content
          content += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;by '
          content += item.entry.atom.author.name
          content += '</li>'
          $('ul.posts').append(content)
      })
  }

  var getNodeItems = function() {
      console.log("about to get node items");
      socket.send(
          'xmpp.buddycloud.retrieve',
          { "node": '/user/chatrecipe@topics.buddycloud.org/chat', rsm: { max:5 } },
          handleItems
      )
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

  var createChatRecipeNode = function() {
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
	       console.error(error);
               console.log('Created ChatRecipe node', data);
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
	      createChatRecipeNode();
              getNodeItems();
          }
      )
  }

  var login = function() {
      socket.send(
          'xmpp.login',
          {
              jid: 'abmargb@buddycloud.org',
              password: 'abmar123'
	  }
      )
      socket.on('xmpp.connection', function(data) {
          console.log('Connected as', data.jid)
          discoverBuddycloudServer()
      })
  }

  socket.on('open', function() {
      console.log('Connected')
      login()
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
