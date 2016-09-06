var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// save all current users
var currentUsers = [];

// save current drawing state
var currentDrawing = "";

io.on('connection', function(socket){
	currentUsers.push(socket.id);
	io.emit('userEvent', currentUsers);
	if(currentDrawing !== "")
	{
		io.emit('drawing', currentDrawing);
	}

	// disconnect
  	socket.on('disconnect', function(){
	    var index = currentUsers.indexOf(socket.id);
	    if (index > -1) {
	      	currentUsers.splice(index, 1);
			io.emit('userEvent', currentUsers);
	    }

  	});

  	// draw
	socket.on('drawing', function(msg){
		currentDrawing = msg;
		io.emit('drawing', msg);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});