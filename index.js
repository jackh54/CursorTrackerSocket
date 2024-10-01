const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 8000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  users.set(socket.id, { id: socket.id });

  // Send the current list of users to the new client
  socket.emit('users', Array.from(users.values()));

  // Broadcast the new user to all other clients
  socket.broadcast.emit('user joined', { id: socket.id });

  socket.on('cursor move', (data) => {
    const user = users.get(socket.id);
    if (user) {
      user.x = data.x;
      user.y = data.y;
      socket.broadcast.emit('cursor update', user);
    }
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', `User ${socket.id.substr(0, 4)}: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    users.delete(socket.id);
    io.emit('user left', socket.id);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
