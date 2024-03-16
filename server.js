const express = require("express");
const http = require("http");
const path = require('path');
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require("./utils/messages.js");
const {userjoin, getcurrentuser, userleft, getRoomUsers} = require('./utils/users.js')

app.use(express.static(path.join(__dirname,'public')));

const botname = "chatbot";

io.on('connection', socket => { 

    socket.on('joinRoom', ({username,room}) => {
         
        const user = userjoin(socket.id,username,room);

        socket.join(user.room);

    socket.emit('message', formatMessage(botname, "Welcome to chatapp"));

    //Broadcast when a user connects
    socket.to(user.room).emit('message', formatMessage(botname,`${user.username} has joined the chat`));

    io.to(user.room).emit('roomusers',{
        room: user.room,
        user: getRoomUsers(user.room)
    })
    })
     
    socket.on('chatmessage', (msg) =>{
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username,msg));
    })
    socket.on('disconnect', () =>{
        const user = userleft(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botname,`${user.username} has left the chat`));
            io.to(user.room).emit('roomusers',{
                room: user.room,
                user: getRoomUsers(user.room)
            })
        }
        
    })
})

const port = 3000 || process.env.PORT;

server.listen(port, () => console.log(`server is running on port no ${port}`));