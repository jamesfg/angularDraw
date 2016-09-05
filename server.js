var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var currentUsers = [];
var currentDrawing = "";

io.on('connection', function(socket){

	
	console.log('a user connected');
	currentUsers.push(socket.id);
	io.emit('userEvent', currentUsers);
	if(currentDrawing !== "")
	{
		io.emit('drawing', currentDrawing);
	}
	

	// disconnect
  	socket.on('disconnect', function(){
    	console.log('user disconnected');
	    var index = currentUsers.indexOf(socket.id);
	    console.log(index);
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