var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	io.emit('currentUsers', socket.id);

  	socket.on('disconnect', function(){
    	console.log('user disconnected');
    	io.emit('disconnectedUser', socket.id);
  	});
	socket.on('drawing', function(msg){
		io.emit('drawing', msg);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});