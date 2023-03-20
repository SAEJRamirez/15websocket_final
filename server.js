const express = require('express')
const PORT = 5000 || process.env.PORT
const path = require('path')
const http = require('http')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')
const socketio = require('socket.io')
const devBotName = 'DevCord Bot'

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {

        //Join room
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        //Welcome current user
        //Emit émet seulement à l'utilisateur
        //io.emit émet à tous les utilisateurs
        socket.emit('message', formatMessage(devBotName,'Welcome to DevCord'))

        //Broadcast when a user connects
        //Broadcast: émet a tous sauf à l'utilisateur
        socket.broadcast.to(user.room).emit('message', formatMessage(devBotName,`${user.username} has joined the chat`))

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })

    //Runs when client disconnects
    //Doit se trouver dans on.connect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user) {
            io.to(user.room).emit('message', formatMessage( devBotName, `${user.username} has left the chat`))
            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage( `${user.username}`, msg))
    })

})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
