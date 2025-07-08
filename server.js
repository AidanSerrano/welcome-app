const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

let gameState = null;

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send current state to the new client
  if (gameState) {
    socket.emit('stateUpdate', gameState);
  }

  socket.on('playerAction', (data) => {
    gameState = data;
    socket.broadcast.emit('stateUpdate', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => console.log('Socket server running on port 3001'));
