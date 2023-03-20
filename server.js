const express = require('express')
const PORT = 5000 || process.env.PORT
const path = require('path')
const http = require('http')
const formatMessage = require('./utils/messages')
const socketio = require('socket.io')
const devBotName = 'DevCord Bot'

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when client connects
io.on('connection', socket => {

    //Welcome current user
    //Emit émet seulement à l'utilisateur
    //io.emit émet à tous les utilisateurs
    socket.emit('message', formatMessage(devBotName,'Welcome to DevCord'))

    //Broadcast when a user connects
    //Broadcast: émet a tous sauf à l'utilisateur
    socket.broadcast.emit('message', formatMessage(devBotName,'A user has joined the chat'))

    //Runs when client disconnects
    //Doit se trouver dans on.connect
    socket.on('disconnect', () => {
        io.emit('message', formatMessage( devBotName,'A user has left the chat'))
    })

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        io.emit('message', formatMessage( 'USER', msg))
    })

})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
