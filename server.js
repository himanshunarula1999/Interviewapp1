const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
  });

  let userList = []; 
  
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId); 

    // socket.on('message', (message, username) => {
    //   let userObject = { userId : userId , username : username};
    //     userList.push(userObject);
    //     console.log(userList);
    //   io.to(roomId).emit('createMessage', message, username);
    // })
    
  })
})
// server.listen(3030 , function(){
//   console.log("Server started at port 3030 !!!");
// })



////////////////////////////////////////////////////
// var PORT = process.env.PORT || 5000;
// var express = require('express');
// var http = require('http');

// var socketIo = require('socket.io');

// var app = express();
// var httpServer = http.Server(app);

// io = socketIo(Server);
var allSockets = {};

// app.use(express.static(__dirname + '/public'));

function httpServerConnected(){
	console.log('Http Server started');
}

function ioServerConnected(socket){
	
	console.log('A new socket connection');
	socket.on('user-joined', userJoined);
	socket.on('disconnect', userLeft);	
	socket.on('message', messageReceived);		
}

function userJoined(user){
	console.log(user + ' joined.');

	allSockets[user] = this;
	var allUsers = Object.keys(allSockets);

	io.emit('user-joined', allUsers);	// call user joined of client
}

function userLeft(){
	var user = null;
	var allKeys = Object.keys(allSockets);

	for(i = 0; i < allKeys.length; i++){
		if(allSockets[allKeys[i]] === this){
			user = allKeys[i];
		}
	}

	console.log(user + ' left.');
	delete allSockets[user];

    this.broadcast.emit('user-left', user);	
}

function messageReceived(data){
	console.log(data);

	if(data.to === 'public'){
		this.broadcast.emit('message', data);
	}
	else{
		allSockets[data.to].emit('message', data);
	}	
}

server.listen(5000,httpServerConnected );
io.on('connection', ioServerConnected);